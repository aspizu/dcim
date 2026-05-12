import {Download, Ellipsis, Link, Trash, X} from "lucide-react"
import {toast} from "sonner"

import {
  $deletePhotoDialogOpen,
  DeletePhotoDialog,
} from "#components/dialogs/delete-photo-dialog"
import {
  $removeFromAlbumDialogOpen,
  RemoveFromAlbumDialog,
} from "#components/dialogs/remove-from-album-dialog"
import {Button} from "#components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "#components/ui/dropdown-menu"
import type {Album, Photo} from "#services/api"
import {$authState, AuthState} from "#stores/auth"

export function PhotoHeaderMenu(props: {photo: Photo; album?: Album}) {
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
              Copy raw link
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <a href={props.photo.image_url} download>
                <Download />
                Download
              </a>
            </DropdownMenuItem>
            {$authState.value === AuthState.AUTHENTICATED && props.album && (
              <DropdownMenuItem
                onClick={() => {
                  $removeFromAlbumDialogOpen.value = true
                }}
              >
                <X />
                Remove from album
              </DropdownMenuItem>
            )}
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
      {props.album && <RemoveFromAlbumDialog photo={props.photo} album={props.album} />}
    </>
  )
}
