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
import {useRemovePhotoFromAlbum} from "#hooks/mutations"
import type {Album, Photo} from "#services/api"

export function RemovePhotoFromAlbumDialog(props: {
  photo: Photo
  album: Album
  open: boolean
  onOpenChange: (value: boolean) => void
}) {
  const navigate = useNavigate()
  const removePhotoFromAlbum = useRemovePhotoFromAlbum(props.album.id)
  return (
    <Dialog open={props.open} onOpenChange={props.onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Remove from {props.album.name}</DialogTitle>
          <DialogDescription>
            This will remove the photo {props.photo.file_name} from this album. The photo will
            not be deleted.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="destructive"
            onClick={() =>
              void removePhotoFromAlbum.mutateAsync(props.photo.id).then(() => {
                props.onOpenChange(false)
                return navigate({to: "/"})
              })
            }
            disabled={removePhotoFromAlbum.isPending}
          >
            {removePhotoFromAlbum.isPending && <Spinner />}
            Remove
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
