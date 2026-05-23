import {batch, signal} from "@preact/signals-react"

export const $editAlbumAdditions = signal<string[]>([])
export const $editAlbumDeletions = signal<string[]>([])

export function resetEditAlbumStore() {
  batch(() => {
    $editAlbumAdditions.value = []
    $editAlbumDeletions.value = []
  })
}
