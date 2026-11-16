import {constants} from "@dcim/common"

import {generateVideoThumbnail} from "#lib/transformations/core/video"
import {$backupQuality, $thumbnailQuality} from "#stores/settings"

import {Client} from "./scheduler"
import type {HandleRequestInput, Output} from "./transformations-worker"
import Worker from "./transformations-worker?worker"

const worker = new Worker()
const client = new Client(worker)

export async function transform(input: File) {
  const thumbnailQuality = $thumbnailQuality.peek()
  const backupQuality = $backupQuality.peek()
  const videoFrame = constants.isVideoMimeType(input.type)
    ? await generateVideoThumbnail(input)
    : undefined
  return await client.request<Output, HandleRequestInput>(
    {fileHandle: input, thumbnailQuality, backupQuality, videoFrame},
    1000 * 60 * 5,
  )
}
