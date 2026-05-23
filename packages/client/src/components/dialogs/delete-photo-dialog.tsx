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
import {useDeletePhoto} from "#hooks/mutations"
import type {Album, Photo} from "#services/api"

export function DeletePhotoDialog(props: {
  photo: Photo
  album?: Album
  open: boolean
  onOpenChange: (value: boolean) => void
}) {
  const navigate = useNavigate()
  const deletePhoto = useDeletePhoto()
  return (
    <Dialog open={props.open} onOpenChange={props.onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete {props.photo.file_name}</DialogTitle>
          <DialogDescription>
            This action cannot be undone. This will permanently delete the photo{" "}
            {props.photo.file_name}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="destructive"
            disabled={deletePhoto.isPending}
            onClick={() =>
              void deletePhoto.mutateAsync(props.photo.id).then(() => {
                props.onOpenChange(false)
                return navigate({
                  to: props.album ? "/a/$album" : "/",
                  params: props.album ? {album: props.album.id} : {},
                })
              })
            }
          >
            {deletePhoto.isPending && <Spinner />}
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
