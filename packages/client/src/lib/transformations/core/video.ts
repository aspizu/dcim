import {constants} from "@dcim/common"

import {calculateResize} from "../operations/resize"

const MAX_FRAME_ATTEMPTS = 10
const MIN_FRAME_VARIANCE = 20 ** 2
const SAMPLE_DIMENSION = 64

function _pixelVariance(pixels: Uint8ClampedArray): number {
  let variance = 0
  const count = pixels.length / 4
  for (let channel = 0; channel < 3; channel++) {
    let sum = 0
    let squaredSum = 0
    for (let index = channel; index < pixels.length; index += 4) {
      const value = pixels[index]!
      sum += value
      squaredSum += value * value
    }
    variance += squaredSum / count - (sum / count) ** 2
  }
  return variance / 3
}

/**
 * Samples up to 10 random video frames, stopping when RGB variation is sufficient.
 * Generates a WebP thumbnail from the most varied sampled frame using DOM elements.
 * Call on the main thread. The thumbnail preserves aspect ratio without upscaling.
 * Resolves with the thumbnail Blob and original video dimensions; rejects on failure.
 * Releases the video and object URL on completion or failure.
 * Decoding and encoding time out after 30 seconds. The original file is unchanged.
 * @param file Video file to decode.
 * @param maxDimension Maximum thumbnail width and height, in pixels.
 */
export async function generateVideoThumbnail(
  file: Blob,
  maxDimension = 1024,
): Promise<{blob: Blob; width: number; height: number}> {
  if (!Number.isInteger(maxDimension) || maxDimension <= 0) {
    throw new Error("Thumbnail dimensions must be positive integers")
  }
  return await new Promise((resolve, reject) => {
    const video = document.createElement("video")
    const url = URL.createObjectURL(file)
    let settled = false
    const timeout = setTimeout(() => {
      _fail(new Error("Video thumbnail generation timed out"))
    }, 30_000)
    function _cleanup(): void {
      settled = true
      clearTimeout(timeout)
      video.onloadeddata = null
      video.onseeked = null
      video.onerror = null
      video.pause()
      video.removeAttribute("src")
      video.load()
      URL.revokeObjectURL(url)
    }
    function _fail(error: Error): void {
      if (settled) return
      _cleanup()
      reject(error)
    }
    video.preload = "auto"
    video.muted = true
    video.playsInline = true
    video.onerror = () => {
      _fail(new Error(video.error?.message || "Failed to decode video"))
    }
    video.onloadeddata = () => {
      video.onloadeddata = null
      try {
        const {videoWidth: width, videoHeight: height} = video
        const resize = calculateResize(
          {width, height},
          {width: maxDimension, height: maxDimension},
          "scale-down",
          false,
        )
        const canvas = document.createElement("canvas")
        canvas.width = Math.max(1, resize.outputWidth)
        canvas.height = Math.max(1, resize.outputHeight)
        const context = canvas.getContext("2d")
        if (!context) {
          throw new Error("Could not get canvas 2D context")
        }
        const sample = document.createElement("canvas")
        sample.width = SAMPLE_DIMENSION
        sample.height = SAMPLE_DIMENSION
        const sampleContext = sample.getContext("2d", {willReadFrequently: true})
        if (!sampleContext) {
          throw new Error("Could not get canvas 2D context")
        }
        let attempts = 0
        let bestVariance = -1
        function _encode(): void {
          video.onseeked = null
          canvas.toBlob(
            (thumbnail) => {
              if (settled) return
              if (!thumbnail || thumbnail.type !== constants.COMPRESSED_IMAGE_MIME_TYPE) {
                _fail(new Error("Failed to encode video thumbnail as WebP"))
                return
              }
              _cleanup()
              resolve({blob: thumbnail, width, height})
            },
            constants.COMPRESSED_IMAGE_MIME_TYPE,
            0.75,
          )
        }
        function _sampleFrame(): void {
          if (settled) return
          try {
            sampleContext!.drawImage(video, 0, 0, sample.width, sample.height)
            const pixels = sampleContext!.getImageData(0, 0, sample.width, sample.height)
            const variance = _pixelVariance(pixels.data)
            attempts++
            if (variance > bestVariance) {
              bestVariance = variance
              context!.drawImage(video, 0, 0, canvas.width, canvas.height)
            }
            if (
              variance >= MIN_FRAME_VARIANCE ||
              attempts >= MAX_FRAME_ATTEMPTS ||
              !Number.isFinite(video.duration) ||
              video.duration <= 0
            ) {
              _encode()
              return
            }
            _seekFrame()
          } catch (error) {
            _fail(error instanceof Error ? error : new Error(String(error)))
          }
        }
        function _seekFrame(): void {
          if (!Number.isFinite(video.duration) || video.duration <= 0) {
            _sampleFrame()
            return
          }
          const time = Math.random() * video.duration
          if (time === video.currentTime) {
            _sampleFrame()
            return
          }
          video.onseeked = _sampleFrame
          video.currentTime = time
        }
        _seekFrame()
      } catch (error) {
        _fail(error instanceof Error ? error : new Error(String(error)))
      }
    }
    video.src = url
    video.load()
  })
}
