import type {PipelineOptions} from "#lib/transformations/types"

import {Client} from "./scheduler"
import Worker from "./transformations-worker?worker"

const worker = new Worker()
const client = new Client(worker)

export async function transform(
  input: Blob | FileSystemFileHandle,
  options: PipelineOptions,
): Promise<ArrayBuffer> {
  const blob = input instanceof FileSystemFileHandle ? await input.getFile() : input
  return await client.request({input: blob, options}, 1000 * 5)
}
