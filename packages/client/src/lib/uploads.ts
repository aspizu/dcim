import axios from "axios"
import exifr from "exifr"

import * as api from "#services/api"

import {sha256} from "./hash"
import {loadImage} from "./transformations/core/images"
import type {PipelineOptions} from "./transformations/types"
import {transform} from "./workers/transformations-client"

const _thumbnailOptions: PipelineOptions = {
  resize: {width: 720, height: 720, fit: "scale-down", letterbox: false},
  convert: {format: "image/webp", quality: 0.3},
}
const _thumbhashOptions: PipelineOptions = {
  resize: {width: 8, height: 8, fit: "fill", letterbox: false},
  convert: {format: "image/webp", quality: 0.0},
}

async function _blobToDataURL(blob: Blob) {
  const buffer = await blob.arrayBuffer()
  const bytes = new Uint8Array(buffer)
  const binary = bytes.reduce((acc, byte) => acc + String.fromCharCode(byte), "")
  const base64 = btoa(binary)
  return `data:${blob.type};base64,${base64}`
}

export async function prepareFileUpload(handle: FileSystemFileHandle) {
  const file = await handle.getFile()
  const [{thumbnail, thumbnailContentSHA256}, contentSHA256, thumbhashBlob, {width, height}] =
    await Promise.all([
      transform(file, _thumbnailOptions).then(async (arrayBuffer) => {
        const thumbnail = new Blob([arrayBuffer], {type: "image/webp"})
        const thumbnailContentSHA256 = await sha256(thumbnail)
        return {thumbnail, thumbnailContentSHA256}
      }),
      sha256(file),
      transform(file, _thumbhashOptions).then(
        (arrayBuffer) => new Blob([arrayBuffer], {type: "image/webp"}),
      ),
      loadImage(file).then((image) => ({width: image.width, height: image.height})),
    ])
  const metadata = await exifr.parse(file)
  const thumbhash = await _blobToDataURL(thumbhashBlob)
  return {
    upload: {
      fileName: handle.name,
      image: {
        contentType: file.type as api.ContentType,
        contentSHA256,
        contentLength: file.size,
      },
      thumbnail: {
        contentType: "image/webp" as api.ContentType,
        contentSHA256: thumbnailContentSHA256,
        contentLength: thumbnail.size,
      },
      thumbhash,
      width,
      height,
      metadata,
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
      "x-amz-checksum-sha256": prepared.upload.image.contentSHA256,
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
      "Content-Type": "image/webp",
      "x-amz-checksum-sha256": prepared.upload.thumbnail.contentSHA256,
      "Cache-Control": "public, max-age=31536000, immutable, no-transform",
      "Content-Disposition": `attachment; filename=${JSON.stringify(prepared.file.name.replace(/\.[^.]+$/, ".webp"))}`,
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
