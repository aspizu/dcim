import {Download, Ellipsis, Link, Trash, X} from "lucide-react"
import {toast} from "sonner"

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

import {
  $deletePhotoDialogOpen,
  $removePhotoFromAlbumDialogOpen,
  DeletePhotoDialog,
  RemovePhotoFromAlbumDialog,
} from "./dialogs"

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
                  $removePhotoFromAlbumDialogOpen.value = true
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
      <DeletePhotoDialog photo={props.photo} album={props.album} />
      {props.album && <RemovePhotoFromAlbumDialog photo={props.photo} album={props.album} />}
    </>
  )
}
