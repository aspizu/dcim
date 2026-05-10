import * as api from "#services/api"
import exifr from "exifr"
import {createWorkerPool, dcim} from "lib-dcim"
import {sha256} from "./hash"

export const thumbnailWorkerPool = createWorkerPool(
  dcim().resize(720, null).avif(50).compile(),
  {workers: 2, jobsPerWorker: Infinity},
)

const _thumbhashWorkerPool = createWorkerPool(dcim().resize(16, 16).avif(0).compile(), {
  workers: 2,
  jobsPerWorker: Infinity,
})

function extractTimestamp(metadata?: Record<string, unknown>): string {
  const rawDate =
    metadata?.DateTimeOriginal || metadata?.CreateDate || metadata?.FileModifyDate || new Date()

  return rawDate instanceof Date ? rawDate.toISOString() : String(rawDate)
}

export async function prepareFileUpload(handle: FileSystemFileHandle) {
  const file = await handle.getFile()

  const [{thumbnail, thumbnailContentSHA256}, contentSHA256, thumbhashBlob] = await Promise.all(
    [
      thumbnailWorkerPool.run(file).then(async (thumb) => ({
        thumbnail: thumb,
        thumbnailContentSHA256: await sha256(thumb),
      })),

      sha256(file),
      _thumbhashWorkerPool.run(file),
    ],
  )

  const metadata = await exifr.parse(file)

  const timestamp = extractTimestamp(metadata)

  const thumbhash = btoa(
    String.fromCharCode(...new Uint8Array(await thumbhashBlob.arrayBuffer())),
  )

  const payload = {
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
  }

  const response = await api.createImage(payload)

  return {
    ...response,
    file,
    thumbnail,
    contentSHA256,
    thumbnailContentSHA256,
  }
}
