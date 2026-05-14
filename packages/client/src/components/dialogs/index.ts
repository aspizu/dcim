import {signal} from "@preact/signals-react"

export {DeletePhotoDialog} from "./delete-photo-dialog"
export {RemovePhotoFromAlbumDialog} from "./remove-photo-from-album-dialog"

export const $deletePhotoDialogOpen = signal(false)
export const $removePhotoFromAlbumDialogOpen = signal(false)
