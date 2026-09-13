import {toast} from "sonner"

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

/** Confirms permanent deletion of multiple photos from the library and all albums. */
export function DeletePhotosDialog(props: {
  galleryKey: string
  photoIDs: string[]
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const deletePhotos = useDeletePhotos()
  async function _delete() {
    if ($authState.value !== AuthState.AUTHENTICATED || deletePhotos.isPending) return
    if (props.photoIDs.length === 0) return
    try {
      await deletePhotos.mutateAsync({
        photoIDs: [...props.photoIDs],
        galleryKey: props.galleryKey,
      })
      props.onOpenChange(false)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to delete selected files")
    }
  }
  return (
    <Dialog
      open={props.open}
      onOpenChange={(open) => {
        if (deletePhotos.isPending) return
        props.onOpenChange(open)
      }}
    >
      <DialogContent
        showCloseButton={!deletePhotos.isPending}
        aria-busy={deletePhotos.isPending}
      >
        <DialogHeader>
          <DialogTitle>Delete {props.photoIDs.length} selected files?</DialogTitle>
          <DialogDescription>
            This permanently deletes the selected files from your library and all albums. This
            action cannot be undone.
            {deletePhotos.isPending && " Keep this page open until deletion finishes."}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="outline"
            disabled={deletePhotos.isPending}
            onClick={() => {
              props.onOpenChange(false)
            }}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            disabled={deletePhotos.isPending || props.photoIDs.length === 0}
            onClick={() => {
              void _delete()
            }}
          >
            {deletePhotos.isPending ? "Deleting…" : "Delete permanently"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
