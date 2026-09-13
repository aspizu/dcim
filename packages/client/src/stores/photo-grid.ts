import {signal} from "@preact/signals-react"

/** The gallery key and photo IDs selected for the current app session. */
export const $photoSelection = signal<{key: string; photoIDs: ReadonlySet<string>}>({
  key: "/",
  photoIDs: new Set(),
})

/** Whether the given photo is selected in its gallery. */
export function isPhotoSelected(key: string, photoID: string): boolean {
  const selection = $photoSelection.value
  return selection.key === key && selection.photoIDs.has(photoID)
}

/** Whether photo clicks in the given gallery toggle selection. */
export function isMultiSelectionMode(key: string): boolean {
  const selection = $photoSelection.value
  return selection.key === key && selection.photoIDs.size > 0
}

/** Clears selection only when it belongs to the given gallery. */
export function clearPhotoSelection(key: string): void {
  if ($photoSelection.value.key !== key) return
  $photoSelection.value = {key, photoIDs: new Set()}
}

/** Selects or deselects a photo, replacing selection from another gallery. */
export function setPhotoSelected(key: string, photoID: string, selected: boolean): void {
  const selection = $photoSelection.value
  if (isPhotoSelected(key, photoID) === selected) return
  const photoIDs = new Set(selection.key === key ? selection.photoIDs : [])
  if (selected) {
    photoIDs.add(photoID)
  } else {
    photoIDs.delete(photoID)
  }
  $photoSelection.value = {key, photoIDs}
}
