import {constants} from "@dcim/common"

import {calculateResize} from "../operations/resize"

/**
 * Generates a WebP thumbnail from the first decoded video frame using DOM elements.
 * Call on the main thread. The thumbnail preserves aspect ratio without upscaling.
 * Reports the Blob or an error through callbacks and releases the video and object URL.
 * Decoding and encoding time out after 30 seconds. The original file is unchanged.
 * @param file Video file to decode.
 * @param onThumbnail Receives the encoded thumbnail and original video dimensions.
 * @param onError Receives decoding, encoding, or timeout errors.
 * @param maxDimension Maximum thumbnail width and height, in pixels.
 */
export function generateVideoThumbnail(
  file: Blob,
  onThumbnail: (thumbnail: Blob, width: number, height: number) => void,
  onError: (error: Error) => void,
  maxDimension = 1024,
): void {
  if (!Number.isInteger(maxDimension) || maxDimension <= 0) {
    onError(new Error("Thumbnail dimensions must be positive integers"))
    return
  }
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
    video.onerror = null
    video.pause()
    video.removeAttribute("src")
    video.load()
    URL.revokeObjectURL(url)
  }
  function _fail(error: Error): void {
    if (settled) return
    _cleanup()
    onError(error)
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
      context.drawImage(video, 0, 0, canvas.width, canvas.height)
      canvas.toBlob(
        (thumbnail) => {
          if (settled) return
          if (!thumbnail || thumbnail.type !== constants.COMPRESSED_IMAGE_MIME_TYPE) {
            _fail(new Error("Failed to encode video thumbnail as WebP"))
            return
          }
          _cleanup()
          onThumbnail(thumbnail, width, height)
        },
        constants.COMPRESSED_IMAGE_MIME_TYPE,
        0.75,
      )
    } catch (error) {
      _fail(error instanceof Error ? error : new Error(String(error)))
    }
  }
  video.src = url
  video.load()
}
