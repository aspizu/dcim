import * as exifr from "exifr"

import {sha256} from "#lib/hash"
import {transform} from "#lib/transformations/pipeline"
import type {PipelineOptions} from "#lib/transformations/types"

import {Server} from "./scheduler"

function _blobToDataURL(buffer: ArrayBuffer, type: string) {
  const bytes = new Uint8Array(buffer)
  const binary = bytes.reduce((acc, byte) => acc + String.fromCharCode(byte), "")
  const base64 = btoa(binary)
  return `data:${type};base64,${base64}`
}

const _thumbnailOptions: PipelineOptions = {
  resize: {width: 720, height: 720, fit: "scale-down", letterbox: false},
  convert: {format: "image/webp", quality: 0.3},
}
const _thumbhashOptions: PipelineOptions = {
  resize: {width: 8, height: 8, fit: "fill", letterbox: false},
  convert: {format: "image/webp", quality: 0.0},
}

export type Output = {
  input: {
    hash: string
    type: string
    metadata: any
    width: number
    height: number
    size: number
  }
  output: {arrayBuffer: ArrayBuffer; type: string; hash: string; thumbhash: string}
}

export class TransformationsWorker extends Server {
  async handleRequest(data: FileSystemFileHandle): Promise<Output> {
    const blob = await data.getFile()
    const [hash, {outhash, outimage, height, width, thumbhash}, metadata] = await Promise.all([
      sha256(blob),
      createImageBitmap(blob).then(async (image) => {
        const [outimage, thumbhash] = await Promise.all([
          transform(image, blob.type, _thumbnailOptions),
          transform(image, blob.type, _thumbhashOptions),
        ])
        const outhash = await sha256(outimage)
        return {
          outimage,
          outhash,
          width: image.width,
          height: image.height,
          thumbhash: _blobToDataURL(thumbhash, _thumbhashOptions.convert?.format ?? blob.type),
        }
      }),
      exifr.parse(blob),
    ])
    return {
      input: {hash, type: blob.type, metadata, height, width, size: blob.size},
      output: {
        arrayBuffer: outimage,
        hash: outhash,
        type: _thumbnailOptions.convert?.format ?? blob.type,
        thumbhash,
      },
    }
  }
}

void new TransformationsWorker()
