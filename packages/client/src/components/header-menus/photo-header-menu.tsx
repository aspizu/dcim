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
import {$authState, AuthState} from "#stores/auth"
import {Download, Ellipsis, Link, Trash} from "lucide-react"
import {toast} from "sonner"

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
              onClick={() => {
                void navigator.clipboard.writeText(props.photo.image_url)
                toast("Copied link to clipboard")
              }}
            >
              <Link />
              Copy Raw Link
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <a href={props.photo.image_url} download>
                <Download />
                Download
              </a>
            </DropdownMenuItem>
            {$authState.value === AuthState.AUTHENTICATED && (
              <DropdownMenuItem
                variant="destructive"
                onClick={() => {
                  $deletePhotoDialogOpen.value = true
                }}
              >
                <Trash />
                Delete
              </DropdownMenuItem>
            )}
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
      <DeletePhotoDialog photo={props.photo} />
    </>
  )
}
