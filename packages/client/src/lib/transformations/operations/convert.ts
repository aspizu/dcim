export function validateFormat(format: string): void {
  if (!format.startsWith("image/")) {
    throw new Error("[lib-dcim] invalid format")
  }
}

export function validateQuality(quality?: number): void {
  if (quality !== undefined && (quality < 0 || quality > 1)) {
    throw new Error("[lib-dcim] quality must be between 0 and 1")
  }
}
