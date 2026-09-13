import {signal} from "@preact/signals-react"

/** The gallery key and photo IDs selected for the current app session. */
export const $photoSelection = signal<{key: string; photoIDs: string[]}>({
  key: "/",
  photoIDs: [],
})

/** Returns the selected photo IDs belonging to the given gallery. */
export function getSelectedPhotoIDs(key: string): string[] {
  const selection = $photoSelection.value
  return selection.key === key ? selection.photoIDs : []
}

/** Whether photo clicks in the given gallery toggle selection. */
export function isMultiSelectionMode(key: string): boolean {
  return getSelectedPhotoIDs(key).length > 0
}

/** Clears selection only when it belongs to the given gallery. */
export function clearPhotoSelection(key: string): void {
  if ($photoSelection.value.key !== key) return
  $photoSelection.value = {key, photoIDs: []}
}

/** Selects or deselects a photo, replacing selection from another gallery. */
export function setPhotoSelected(key: string, photoID: string, selected: boolean): void {
  const ids = getSelectedPhotoIDs(key)
  if (selected) {
    if (ids.includes(photoID)) return
    $photoSelection.value = {key, photoIDs: [...ids, photoID]}
  } else {
    if ($photoSelection.value.key !== key) return
    $photoSelection.value = {key, photoIDs: ids.filter((id) => id !== photoID)}
  }
}
