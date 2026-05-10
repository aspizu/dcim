import {
  $deleteImageDialogOpen,
  DeleteImageDialog,
} from "#components/dialogs/image-delete-dialog"
import {Button} from "#components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "#components/ui/dropdown-menu"
import type {Image} from "#services/api"
import {Ellipsis, Trash} from "lucide-react"

export function ImageHeaderMenu(props: {image: Image}) {
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
                $deleteImageDialogOpen.value = true
              }}
            >
              <Trash />
              Delete
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
      <DeleteImageDialog image={props.image} />
    </>
  )
}
