import {
  $deletePhotoDialogOpen,
  DeletePhotoDialog,
} from "#components/dialogs/image-delete-dialog"
import {Button} from "#components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "#components/ui/dropdown-menu"
import type {Photo} from "#services/api"
import {Ellipsis, Trash} from "lucide-react"

export function PhotoHeaderMenu(props: {photo: Photo}) {
  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <Ellipsis />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuGroup>
            <DropdownMenuItem
              variant="destructive"
              onClick={() => {
                $deletePhotoDialogOpen.value = true
              }}
            >
              <Trash />
              Delete
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
      <DeletePhotoDialog photo={props.photo} />
    </>
  )
}
