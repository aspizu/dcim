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
import type {Image} from "#services/api"
import * as api from "#services/api"
import {signal} from "@preact/signals-react"
import {useNavigate} from "@tanstack/react-router"
import {useState} from "react"

export const $deleteImageDialogOpen = signal(false)

export function DeleteImageDialog(props: {image: Image}) {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  async function onDeleteClick() {
    setIsLoading(true)
    await api.deleteImage({id: props.image.id})
    $deleteImageDialogOpen.value = false
    setIsLoading(false)
    await navigate({to: "/"})
  }
  return (
    <Dialog
      open={$deleteImageDialogOpen.value}
      onOpenChange={(value) => {
        $deleteImageDialogOpen.value = value
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Photo</DialogTitle>
          <DialogDescription>
            This action cannot be undone. This will permanently delete the photo{" "}
            {props.image.file_name}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="destructive"
            disabled={isLoading}
            onClick={() => void onDeleteClick()}
          >
            {isLoading && <Spinner />}
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
