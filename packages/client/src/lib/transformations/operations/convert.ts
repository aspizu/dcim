import {constants} from "@dcim/common"

export function validateFormat(format: string): void {
  if (!constants.isImageMimeType(format)) {
    throw new Error("[lib-dcim] invalid format")
  }
}

export function validateQuality(quality?: number): void {
  if (quality !== undefined && (quality < 0 || quality > 1)) {
    throw new Error("[lib-dcim] quality must be between 0 and 1")
  }
}
