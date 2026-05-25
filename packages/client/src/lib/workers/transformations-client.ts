import {getConfig} from "#lib/config"

import {Client} from "./scheduler"
import type {HandleRequestInput, Output} from "./transformations-worker"
import Worker from "./transformations-worker?worker"

const worker = new Worker()
const client = new Client(worker)

export async function transform(input: FileSystemFileHandle) {
  const thumbnailQuality = getConfig("thumbnailQuality") ?? "balanced"
  const backupQuality = getConfig("backupQuality") ?? "original"
  return await client.request<Output, HandleRequestInput>(
    {fileHandle: input, thumbnailQuality, backupQuality},
    1000 * 5,
  )
}
