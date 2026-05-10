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
import {signal} from "@preact/signals-react"
import {useNavigate} from "@tanstack/react-router"
import {useState} from "react"

export const $deletePhotoDialogOpen = signal(false)

export function DeletePhotoDialog(props: {photo: Photo}) {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  async function _onDeleteClick() {
    setIsLoading(true)
    await api.deletePhoto({id: props.photo.id})
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
