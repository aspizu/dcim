import {useNavigate} from "@tanstack/react-router"

import {Button} from "#components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "#components/ui/dialog"
import {Spinner} from "#components/ui/spinner"
import {useDeleteAlbum} from "#hooks/mutations"
import type {Album} from "#services/api"

export function DeleteAlbumDialog(props: {
  album: Album
  open: boolean
  onOpenChange: (value: boolean) => void
}) {
  const navigate = useNavigate()
  const deleteAlbum = useDeleteAlbum()
  return (
    <Dialog open={props.open} onOpenChange={props.onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete {props.album.name}</DialogTitle>
          <DialogDescription>
            This action cannot be undone. This will permanently delete the album{" "}
            {props.album.name}. Photos will not be deleted.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="destructive"
            disabled={deleteAlbum.isPending}
            onClick={() =>
              void deleteAlbum.mutateAsync(props.album.id).then(() => {
                props.onOpenChange(false)
                return navigate({
                  to: "/",
                  params: props.album ? {album: props.album.id} : {},
                })
              })
            }
          >
            {deleteAlbum.isPending && <Spinner />}
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
