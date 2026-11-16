import {constants} from "@dcim/common"
import Mustache from "mustache"

import type {Photo} from "#services/api"
import {$htmlImageTemplate, $htmlVideoTemplate} from "#stores/settings"

function _photoAlt(photo: Photo) {
  if (!photo.caption) {
    return photo.file_name
  }
  try {
    const {content} = JSON.parse(photo.caption) as {content?: string}
    return content || photo.file_name
  } catch {
    return photo.file_name
  }
}

export function photoMarkdown(photo: Photo) {
  const alt = _photoAlt(photo)
    .replace(/[\\`*_[\]<>!&]/g, "\\$&")
    .replace(/\s+/g, " ")
  const url = photo.image_url.replace(/[<>\s\\]/g, encodeURIComponent)
  const prefix = constants.isVideoExtension(photo.file_name) ? "" : "!"
  return `${prefix}[${alt}](<${url}>)`
}

export function photoHtml(photo: Photo) {
  const src = photo.image_url
  const alt = _photoAlt(photo)
  const poster = photo.thumbnail_url
  const width = photo.width.toString()
  const height = photo.height.toString()
  return Mustache.render(
    constants.isVideoExtension(photo.file_name)
      ? $htmlVideoTemplate.peek()
      : $htmlImageTemplate.peek(),
    {src, alt, poster, width, height},
  )
}
