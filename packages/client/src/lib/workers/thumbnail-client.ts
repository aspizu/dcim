import {Client} from "./scheduler"
import type {HandleRequestInput, Output} from "./thumbnail-worker"
import Worker from "./thumbnail-worker?worker"

const worker = new Worker()
const client = new Client(worker)

export async function createThumbnail(
  fileHandle: FileSystemFileHandle,
  maxDimension = 300,
): Promise<Output> {
  return await client.request<Output, HandleRequestInput>({fileHandle, maxDimension}, 1000 * 5)
}
