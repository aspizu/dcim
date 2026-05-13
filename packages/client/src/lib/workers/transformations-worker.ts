import {transform} from "#lib/transformations/pipeline"
import type {PipelineOptions} from "#lib/transformations/types"

import {Server} from "./scheduler"

class TransformationsWorker extends Server {
  async handleRequest(data: {
    options: PipelineOptions
    input: Blob | FileSystemFileHandle
  }): Promise<ArrayBuffer> {
    return await transform(data.input, data.options)
  }
}

void new TransformationsWorker()
