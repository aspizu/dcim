import {Client} from "./scheduler"
import type {Output} from "./transformations-worker"
import Worker from "./transformations-worker?worker"

const worker = new Worker()
const client = new Client(worker)

export async function transform(input: FileSystemFileHandle) {
  return await client.request<Output, FileSystemFileHandle>(input, 1000 * 5)
}
