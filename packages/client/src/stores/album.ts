import {signal} from "@preact/signals-react"

export const $addToAlbumDialogOpen = signal(false)
export const $addToAlbumSelection = signal<string[]>([])
