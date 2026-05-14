import {drawImage} from "./core/canvas"
import {validateFormat, validateQuality} from "./operations/convert"
import {calculateResize} from "./operations/resize"
import type {PipelineOptions} from "./types"

export async function transform(
  image: ImageBitmap,
  type: string,
  options: PipelineOptions,
): Promise<ArrayBuffer> {
  if (!options.resize && !options.convert) {
    throw new Error("[lib-dcim] transform called with empty options")
  }
  if (options.convert) {
    validateFormat(options.convert.format ?? "image/avif")
    validateQuality(options.convert.quality ?? 1)
  }
  const originalSize = {width: image.width, height: image.height}
  const resizeResult = calculateResize(
    originalSize,
    {
      width: options.resize?.width ?? originalSize.width,
      height: options.resize?.height ?? originalSize.height,
    },
    options.resize?.fit ?? "none",
    options.resize?.letterbox ?? true,
  )
  const canvas = drawImage(image, resizeResult, "black")
  const format = options.convert?.format ?? type
  const quality = options.convert?.quality ?? 1
  const result = await canvas.convertToBlob({type: format, quality})
  return result.arrayBuffer()
}
