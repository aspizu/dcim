import {transform} from "#lib/transformations/pipeline"
import type {PipelineOptions} from "#lib/transformations/types"

import {Server} from "./scheduler"

export type HandleRequestInput = {
  fileHandle: FileSystemFileHandle
  maxDimension: number
}

export type Output = {
  buffer: ArrayBuffer
  type: string
}

export class ThumbnailWorker extends Server {
  async handleRequest(input: HandleRequestInput): Promise<Output> {
    const {fileHandle, maxDimension} = input
    const file = await fileHandle.getFile()
    const image = await createImageBitmap(file)

    const options: PipelineOptions = {
      resize: {width: maxDimension, height: maxDimension, fit: "scale-down", letterbox: false},
    }
    const buffer = await transform(image, file.type, options)
    image.close()

    return {buffer, type: file.type}
  }
}

void new ThumbnailWorker()
