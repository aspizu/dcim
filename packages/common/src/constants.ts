/**
 * Image MIME types supported by modern browsers, with accepted extensions.
 * The first extension is canonical.
 */
export const IMAGE_MIME_TYPES = {
  "image/jpeg": [".jpg", ".jpeg", ".jfif", ".pjpeg", ".pjp"],
  "image/png": [".png"],
  "image/webp": [".webp"],
  "image/avif": [".avif"],
  "image/bmp": [".bmp"],
} as const

/**
 * Video MIME types supported by modern browsers, with accepted extensions.
 * The first extension is canonical. Playback also depends on the encoded codecs.
 */
export const VIDEO_MIME_TYPES = {
  "video/mp4": [".mp4", ".m4v"],
  "video/webm": [".webm"],
} as const

/** Supported image and video MIME types, with accepted extensions. */
export const MIME_TYPES = {...IMAGE_MIME_TYPES, ...VIDEO_MIME_TYPES} as const

/** Expected MIME type for compressed images. */
export const COMPRESSED_IMAGE_MIME_TYPE = "image/webp" satisfies keyof typeof IMAGE_MIME_TYPES

/** Canonical extension for compressed images, derived from their MIME type. */
export const COMPRESSED_IMAGE_EXTENSION = IMAGE_MIME_TYPES[COMPRESSED_IMAGE_MIME_TYPE][0]

/** Checks whether a MIME type is in the supported image map. */
export function isImageMimeType(type: string): type is keyof typeof IMAGE_MIME_TYPES {
  return Object.hasOwn(IMAGE_MIME_TYPES, type)
}

/** Checks whether a MIME type is in the supported video map. */
export function isVideoMimeType(type: string): type is keyof typeof VIDEO_MIME_TYPES {
  return Object.hasOwn(VIDEO_MIME_TYPES, type)
}

function _fileExtension(path: string): string {
  const name = path.split(/[\\/]/).at(-1) ?? ""
  const dot = name.lastIndexOf(".")
  if (dot >= 0) return name.slice(dot).toLowerCase()
  return name === path && name ? `.${name.toLowerCase()}` : ""
}

/** Infers a supported image MIME type from an extension, filename, or POSIX/Windows path. */
export function getImageMimeType(path: string): keyof typeof IMAGE_MIME_TYPES | undefined {
  const extension = _fileExtension(path)
  return Object.keys(IMAGE_MIME_TYPES)
    .filter(isImageMimeType)
    .find((type) => IMAGE_MIME_TYPES[type].some((value) => value === extension))
}

/**
 * Checks an image extension, filename, or POSIX/Windows path against the supported map.
 * Extensions may include the leading dot. Matching is case-insensitive.
 */
export function isImageExtension(path: string): boolean {
  const extension = _fileExtension(path)
  return Object.values(IMAGE_MIME_TYPES).some((extensions: readonly string[]) =>
    extensions.includes(extension),
  )
}

/**
 * Checks a video extension, filename, or POSIX/Windows path against the supported map.
 * Extensions may include the leading dot. Matching is case-insensitive.
 */
export function isVideoExtension(path: string): boolean {
  const extension = _fileExtension(path)
  return Object.values(VIDEO_MIME_TYPES).some((extensions: readonly string[]) =>
    extensions.includes(extension),
  )
}
