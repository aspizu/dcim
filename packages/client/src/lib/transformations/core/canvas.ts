import type {ResizeResult} from "../types"

export function createCanvas(width: number, height: number): OffscreenCanvas {
  const canvas = new OffscreenCanvas(width, height)
  const ctx = canvas.getContext("2d")

  if (!ctx) {
    throw new Error("[lib-dcim] could not get 2d context")
  }

  return canvas
}

export function drawImage(
  image: ImageBitmap,
  resize: ResizeResult,
  backgroundColor: string,
): OffscreenCanvas {
  const canvas = createCanvas(resize.outputWidth, resize.outputHeight)
  const ctx = canvas.getContext("2d")!

  ctx.fillStyle = backgroundColor
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  ctx.drawImage(image, resize.x, resize.y, resize.w, resize.h)

  return canvas
}
