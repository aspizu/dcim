import {Button} from "#components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "#components/ui/dialog"
import {useDeletePhotos} from "#hooks/mutations"
import {$authState, AuthState} from "#stores/auth"
import {clearPhotoSelection} from "#stores/photo-grid"

/** Confirms permanent deletion of multiple photos from the library and all albums. */
export function DeletePhotosDialog(props: {
  galleryKey: string
  photoIDs: string[]
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const deletePhotos = useDeletePhotos()
  function _delete() {
    if ($authState.value !== AuthState.AUTHENTICATED) return
    deletePhotos.mutate(props.photoIDs)
    clearPhotoSelection(props.galleryKey)
    props.onOpenChange(false)
  }
  return (
    <Dialog open={props.open} onOpenChange={props.onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete {props.photoIDs.length} selected files?</DialogTitle>
          <DialogDescription>
            This permanently deletes the selected files from your library and all albums. This
            action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => {
              props.onOpenChange(false)
            }}
          >
            Cancel
          </Button>
          <Button variant="destructive" onClick={_delete}>
            Delete permanently
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
