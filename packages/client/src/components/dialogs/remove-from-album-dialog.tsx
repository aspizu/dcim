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
import * as api from "#services/api"
import {signal} from "@preact/signals-react"
import {useQueryClient} from "@tanstack/react-query"
import {useNavigate} from "@tanstack/react-router"
import {useState} from "react"

export const $removeFromAlbumDialogOpen = signal(false)

export function RemoveFromAlbumDialog(props: {photo: api.Photo; album: api.Album}) {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  async function _onRemoveClick() {
    setIsLoading(true)
    await api.removePhotoFromAlbum({id: props.album.id, photoID: props.photo.id})
    queryClient.setQueryData(["album", props.album.id], (old: api.AlbumWithPhotos) => ({
      ...old,
      photos: old.photos.filter((photo) => photo.id !== props.photo.id),
    }))
    $removeFromAlbumDialogOpen.value = false
    setIsLoading(false)
    await navigate({to: "/a/$album", params: {album: props.album.id}})
  }
  return (
    <Dialog
      open={$removeFromAlbumDialogOpen.value}
      onOpenChange={(value) => {
        $removeFromAlbumDialogOpen.value = value
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Remove from Album</DialogTitle>
          <DialogDescription>
            This will remove the photo {props.photo.file_name} from the album {props.album.name}
            . The photo will not be deleted.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="destructive"
            onClick={() => void _onRemoveClick()}
            disabled={isLoading}
          >
            {isLoading && <Spinner />}
            Remove
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
