import type {Dimensions, FitMode, ResizeResult} from "../types"

function _validateDimensions(size: Dimensions): void {
  if (size.width <= 0 || size.height <= 0) {
    throw new Error("[lib-dcim] original dimensions must be > 0")
  }
}

function _resolveTargetSize(
  original: Dimensions,
  target: {width: number | null; height: number | null},
): Dimensions {
  const {width: ow, height: oh} = original
  if (target.width == null && target.height == null) {
    return {width: ow, height: oh}
  }
  if (target.width == null) {
    const h = target.height as number
    return {width: Math.round((ow / oh) * h), height: h}
  }
  if (target.height == null) {
    const w = target.width as number
    return {width: w, height: Math.round((oh / ow) * w)}
  }
  return {width: target.width, height: target.height}
}

function _applyFill(target: Dimensions): ResizeResult {
  return {
    outputWidth: target.width,
    outputHeight: target.height,
    x: 0,
    y: 0,
    w: target.width,
    h: target.height,
  }
}

function _applyContain(original: Dimensions, target: Dimensions): ResizeResult {
  const scale = Math.min(target.width / original.width, target.height / original.height)
  const w = Math.round(original.width * scale)
  const h = Math.round(original.height * scale)
  return {
    outputWidth: target.width,
    outputHeight: target.height,
    x: Math.floor((target.width - w) / 2),
    y: Math.floor((target.height - h) / 2),
    w,
    h,
  }
}

function _applyCover(original: Dimensions, target: Dimensions): ResizeResult {
  const scale = Math.max(target.width / original.width, target.height / original.height)
  const w = Math.round(original.width * scale)
  const h = Math.round(original.height * scale)
  return {
    outputWidth: target.width,
    outputHeight: target.height,
    x: Math.floor((target.width - w) / 2),
    y: Math.floor((target.height - h) / 2),
    w,
    h,
  }
}

function _applyScaleDown(original: Dimensions, target: Dimensions): ResizeResult {
  const scale = Math.min(target.width / original.width, target.height / original.height, 1)
  const w = Math.round(original.width * scale)
  const h = Math.round(original.height * scale)
  return {
    outputWidth: target.width,
    outputHeight: target.height,
    x: Math.floor((target.width - w) / 2),
    y: Math.floor((target.height - h) / 2),
    w,
    h,
  }
}

function _applyNone(original: Dimensions, target: Dimensions): ResizeResult {
  return {
    outputWidth: target.width,
    outputHeight: target.height,
    x: Math.floor((target.width - original.width) / 2),
    y: Math.floor((target.height - original.height) / 2),
    w: original.width,
    h: original.height,
  }
}

function _applyNoLetterbox(result: ResizeResult): ResizeResult {
  return {...result, outputWidth: result.w, outputHeight: result.h, x: 0, y: 0}
}

export function calculateResize(
  original: Dimensions,
  target: {width: number | null; height: number | null},
  fit: FitMode,
  letterbox = true,
): ResizeResult {
  _validateDimensions(original)
  const resolvedTarget = _resolveTargetSize(original, target)
  let result: ResizeResult
  switch (fit) {
    case "fill":
      result = _applyFill(resolvedTarget)
      break
    case "contain":
      result = _applyContain(original, resolvedTarget)
      break
    case "cover":
      result = _applyCover(original, resolvedTarget)
      break
    case "scale-down":
      result = _applyScaleDown(original, resolvedTarget)
      break
    case "none":
      result = _applyNone(original, resolvedTarget)
      break
  }
  return letterbox ? result : _applyNoLetterbox(result)
}
