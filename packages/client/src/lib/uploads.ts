import axios from "axios"
import exifr from "exifr"
import {createWorkerPool, dcim} from "lib-dcim"

import * as api from "#services/api"

import {sha256} from "./hash"
import {getImageDimensions} from "./images"

export const thumbnailWorkerPool = createWorkerPool(
  dcim().resize(720, null).avif(50).compile(),
  {workers: 2, jobsPerWorker: Infinity},
)

const _thumbhashWorkerPool = createWorkerPool(dcim().resize(16, 16).avif(1).compile(), {
  workers: 2,
  jobsPerWorker: Infinity,
})

async function _blobToDataURL(blob: Blob) {
  const buffer = await blob.arrayBuffer()
  const bytes = new Uint8Array(buffer)
  const binary = bytes.reduce((acc, byte) => acc + String.fromCharCode(byte), "")
  const base64 = btoa(binary)
  return `data:${blob.type};base64,${base64}`
}

function _extractTimestamp(metadata?: Record<string, string | Date>): string {
  let rawDate: string | Date = new Date()
  if (metadata) {
    rawDate =
      metadata.DateTimeOriginal || metadata.CreateDate || metadata.FileModifyDate || rawDate
  }
  if (rawDate instanceof Date) {
    return rawDate.toISOString()
  }
  const date = new Date(rawDate)
  return date.toISOString()
}

export async function prepareFileUpload(handle: FileSystemFileHandle) {
  const file = await handle.getFile()
  const [{thumbnail, thumbnailContentSHA256}, contentSHA256, thumbhashBlob, {width, height}] =
    await Promise.all([
      thumbnailWorkerPool.run(file).then(async (thumb) => ({
        thumbnail: thumb,
        thumbnailContentSHA256: await sha256(thumb),
      })),
      sha256(file),
      _thumbhashWorkerPool.run(file),
      getImageDimensions(file),
    ])
  const metadata = await exifr.parse(file)
  const timestamp = _extractTimestamp(metadata)
  const thumbhash = await _blobToDataURL(thumbhashBlob)
  return {
    upload: {
      contentLength: file.size,
      contentType: file.type as api.ContentType,
      thumbnailContentLength: thumbnail.size,
      thumbnailContentType: "image/avif" as const,
      fileName: handle.name,
      contentSHA256,
      thumbnailContentSHA256,
      thumbhash,
      timestamp,
      metadata,
      width,
      height,
    },
    file,
    thumbnail,
  }
}

type Prepared = Awaited<ReturnType<typeof prepareFileUpload>>

export async function completeFileUpload(
  prepared: Prepared,
  clientId: string,
  onUploadProgress: (id: string, progress: number) => void,
) {
  const uploaded = await api.createPhoto(prepared.upload)
  const res1 = await axios.put(uploaded.imagePresignedURL, prepared.file, {
    headers: {
      "Content-Type": prepared.file.type,
      "x-amz-checksum-sha256": prepared.upload.contentSHA256,
      "Cache-Control": "public, max-age=31536000, immutable, no-transform",
      "Content-Disposition": `attachment; filename=${JSON.stringify(prepared.file.name)}`,
    },
    onUploadProgress(e) {
      onUploadProgress(clientId, (e.loaded / e.total!) * 75)
    },
  })
  if (res1.status !== 200) {
    console.error("Failed to upload image", res1.status, res1.data)
    return
  }
  const res2 = await axios.put(uploaded.thumbnailPresignedURL, prepared.thumbnail, {
    headers: {
      "Content-Type": "image/avif",
      "x-amz-checksum-sha256": prepared.upload.thumbnailContentSHA256,
      "Cache-Control": "public, max-age=31536000, immutable, no-transform",
      "Content-Disposition": `attachment; filename=${JSON.stringify(prepared.file.name.replace(/\.[^.]+$/, ".avif"))}`,
    },
    onUploadProgress(e) {
      onUploadProgress(clientId, 75 + (e.loaded / e.total!) * 25)
    },
  })
  if (res2.status !== 200) {
    console.error("Failed to upload thumbnail", res2.status, res2.data)
    return
  }
  await api.confirmPhotoUploaded({id: uploaded.id})
  return uploaded.id
}
