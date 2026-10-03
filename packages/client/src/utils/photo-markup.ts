import {constants} from "@dcim/common"
import _ from "lodash"

import type {Photo} from "#services/api"

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
  const src = _.escape(photo.image_url)
  const alt = _.escape(_photoAlt(photo))
  return constants.isVideoExtension(photo.file_name)
    ? `<video src="${src}" poster="${_.escape(photo.thumbnail_url)}" aria-label="${alt}" width="${photo.width}" height="${photo.height}" controls autoplay muted playsinline></video>`
    : `<img src="${src}" alt="${alt}" width="${photo.width}" height="${photo.height}" loading="lazy" />`
}
