export type FitMode = "fill" | "contain" | "cover" | "scale-down" | "none"

export interface Dimensions {
  width: number
  height: number
}

export interface ResizeOptions {
  fit?: FitMode
}

export interface PipelineOptions {
  resize?: {width?: number | null; height?: number | null; fit?: FitMode; letterbox?: boolean}
  convert?: {format?: string; quality?: number}
}

export interface ResizeResult {
  outputWidth: number
  outputHeight: number
  x: number
  y: number
  w: number
  h: number
}
