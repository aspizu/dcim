import * as api from "#services/api"
import exifr from "exifr"
import {createWorkerPool, dcim} from "lib-dcim"
import {sha256} from "./hash"

const poolOptions = {workers: 2, jobsPerWorker: Infinity}

export const thumbnailWorkerPools = createWorkerPool(
  dcim().resize(480, null).avif(65).compile(),
  poolOptions,
)

function extractTimestamp(metadata?: Record<string, unknown>): string {
  const rawDate =
    metadata?.DateTimeOriginal || metadata?.CreateDate || metadata?.FileModifyDate || new Date()

  return rawDate instanceof Date ? rawDate.toISOString() : String(rawDate)
}

export async function prepareFileUpload(handle: FileSystemFileHandle) {
  const file = await handle.getFile()

  const thumbnail = await thumbnailWorkerPools.run(file)

  const [contentSHA256, thumbnailContentSHA256] = await Promise.all([
    sha256(file),
    sha256(thumbnail),
  ])

  const metadata = await exifr.parse(file)

  const timestamp = extractTimestamp(metadata)

  const payload = {
    contentLength: file.size,
    contentType: file.type as api.ContentType,
    thumbnailContentLength: thumbnail.size,
    thumbnailContentType: "image/avif" as const,
    fileName: handle.name,
    contentSHA256,
    thumbnailContentSHA256,
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
