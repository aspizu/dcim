import {signal} from "@preact/signals-react"
import {useQueryClient} from "@tanstack/react-query"
import {useNavigate} from "@tanstack/react-router"
import {useState} from "react"

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
import type {Photo} from "#services/api"
import * as api from "#services/api"

export const $deletePhotoDialogOpen = signal(false)

export function DeletePhotoDialog(props: {photo: Photo}) {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  async function _onDeleteClick() {
    setIsLoading(true)
    await api.deletePhoto({id: props.photo.id})
    queryClient.setQueryData(["photos"], (old: api.Photo[]) =>
      old.filter((photo) => photo.id !== props.photo.id),
    )
    const albumKeys = queryClient.getQueriesData({queryKey: ["albums"]})
    for (const albumKey of albumKeys) {
      queryClient.setQueryData(albumKey, (old: api.AlbumWithPhotos) => {
        return {...old, photos: old.photos.filter((photo) => photo.id !== props.photo.id)}
      })
    }
    $deletePhotoDialogOpen.value = false
    setIsLoading(false)
    await navigate({to: "/"})
  }
  return (
    <Dialog
      open={$deletePhotoDialogOpen.value}
      onOpenChange={(value) => {
        $deletePhotoDialogOpen.value = value
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Photo</DialogTitle>
          <DialogDescription>
            This action cannot be undone. This will permanently delete the photo{" "}
            {props.photo.file_name}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="destructive"
            disabled={isLoading}
            onClick={() => void _onDeleteClick()}
          >
            {isLoading && <Spinner />}
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
