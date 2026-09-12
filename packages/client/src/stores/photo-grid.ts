import {computed, signal} from "@preact/signals-react"

/** Photo IDs selected in the photo grid for the current app session. */
export const $selectedPhotoIDs = signal<string[]>([])

/** Whether photo clicks toggle selection instead of opening the photo. */
export const $isMultiSelectionMode = computed(() => $selectedPhotoIDs.value.length > 0)

/** Selects or deselects a photo without changing other selections. */
export function setPhotoSelected(photoID: string, selected: boolean): void {
  const ids = $selectedPhotoIDs.value
  if (selected) {
    if (ids.includes(photoID)) return
    $selectedPhotoIDs.value = [...ids, photoID]
  } else {
    $selectedPhotoIDs.value = ids.filter((id) => id !== photoID)
  }
}
