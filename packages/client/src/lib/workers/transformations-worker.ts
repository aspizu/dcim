import * as exifr from "exifr"

import {getConfig} from "#lib/config"
import {sha256} from "#lib/hash"
import {transform} from "#lib/transformations/pipeline"
import type {PipelineOptions} from "#lib/transformations/types"

import {Server} from "./scheduler"

const DEFAULT_THUMBNAIL_QUALITY = "balanced"
const DEFAULT_BACKUP_QUALITY = "original"

const THUMBNAIL_PRESETS: Record<string, PipelineOptions> = {
  low: {
    resize: {width: 480, height: 480, fit: "scale-down", letterbox: false},
    convert: {format: "image/webp", quality: 0.25},
  },
  balanced: {
    resize: {width: 720, height: 720, fit: "scale-down", letterbox: false},
    convert: {format: "image/webp", quality: 0.5},
  },
  high: {
    resize: {width: 1024, height: 1024, fit: "scale-down", letterbox: false},
    convert: {format: "image/webp", quality: 0.75},
  },
}

const THUMBHASH_PIPELINE: PipelineOptions = {
  resize: {width: 8, height: 8, fit: "fill", letterbox: false},
  convert: {format: "image/webp", quality: 0.0},
}

const STORAGE_SAVER_PIPELINE: PipelineOptions = {
  convert: {format: "image/webp", quality: 0.9},
}

export type ImageEntry = {
  arrayBuffer: ArrayBuffer
  hash: string
  type: string
  metadata: any
  width: number
  height: number
  size: number
}

export type ThumbnailEntry = {
  arrayBuffer: ArrayBuffer
  hash: string
  type: string
  thumbhash: string
}

export type Output = {
  image: ImageEntry
  thumbnail: ThumbnailEntry
}

function compressionRatio(
  width: number,
  height: number,
  fileSizeBytes: number,
  bitDepth = 24,
): number {
  return (width * height * (bitDepth / 8)) / fileSizeBytes
}

function arrayBufferToDataURL(buffer: ArrayBuffer, mimeType: string): string {
  const bytes = new Uint8Array(buffer)
  const binary = bytes.reduce((acc, byte) => acc + String.fromCharCode(byte), "")
  return `data:${mimeType};base64,${btoa(binary)}`
}

export class TransformationsWorker extends Server {
  async handleRequest(fileHandle: FileSystemFileHandle): Promise<Output> {
    const blob = await fileHandle.getFile()
    const metadata = await exifr.parse(blob)
    const image = await createImageBitmap(blob)

    const thumbnailQuality = getConfig("thumbnailQuality") ?? DEFAULT_THUMBNAIL_QUALITY
    const backupQuality = getConfig("backupQuality") ?? DEFAULT_BACKUP_QUALITY

    const [thumbnailBuffer, thumbhashBuffer] = await Promise.all([
      transform(image, blob.type, THUMBNAIL_PRESETS[thumbnailQuality]),
      transform(image, blob.type, THUMBHASH_PIPELINE),
    ])
    const thumbnailHash = await sha256(thumbnailBuffer)
    const thumbhashDataURL = arrayBufferToDataURL(
      thumbhashBuffer,
      THUMBHASH_PIPELINE.convert?.format ?? blob.type,
    )

    const thumbnail: ThumbnailEntry = {
      arrayBuffer: thumbnailBuffer,
      hash: thumbnailHash,
      type: THUMBNAIL_PRESETS[thumbnailQuality].convert?.format ?? blob.type,
      thumbhash: thumbhashDataURL,
    }

    let imageBuffer: ArrayBuffer
    let imageType: string
    let imageSize: number

    if (backupQuality === "original") {
      imageBuffer = await blob.arrayBuffer()
      imageType = blob.type
      imageSize = blob.size
    } else if (backupQuality === "smart") {
      const ratio = compressionRatio(image.width, image.height, blob.size)
      if (ratio < 0.15) {
        imageBuffer = await blob.arrayBuffer()
        imageType = blob.type
        imageSize = blob.size
      } else {
        imageBuffer = await transform(image, blob.type, STORAGE_SAVER_PIPELINE)
        imageType = STORAGE_SAVER_PIPELINE.convert!.format!
        imageSize = imageBuffer.byteLength
      }
    } else if (backupQuality === "storageSaver") {
      imageBuffer = await transform(image, blob.type, STORAGE_SAVER_PIPELINE)
      imageType = STORAGE_SAVER_PIPELINE.convert!.format!
      imageSize = imageBuffer.byteLength
    } else {
      throw new Error(`backupQuality is invalid: ${backupQuality}`)
    }

    const imageHash = await sha256(imageBuffer)

    return {
      image: {
        arrayBuffer: imageBuffer,
        hash: imageHash,
        type: imageType,
        metadata: metadata ?? {},
        width: image.width,
        height: image.height,
        size: imageSize,
      },
      thumbnail,
    }
  }
}

void new TransformationsWorker()
