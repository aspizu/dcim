import {Download, Ellipsis, LinkIcon, Trash, X} from "lucide-react"
import {useState} from "react"
import {toast} from "sonner"

import {Button} from "#components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "#components/ui/dropdown-menu"
import type {Album, Photo} from "#services/api"
import {$authState, AuthState} from "#stores/auth"

import {DeletePhotoDialog, RemovePhotoFromAlbumDialog} from "../dialogs"
import {UserMenuItems} from "./user-menu-items"

export function PhotoHeaderMenu(props: {photo: Photo; album?: Album}) {
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [isRemoveOpen, setIsRemoveOpen] = useState(false)
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
              <LinkIcon />
              Copy link
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
                  setIsRemoveOpen(true)
                }}
              >
                <X />
                Remove
              </DropdownMenuItem>
            )}
            {$authState.value === AuthState.AUTHENTICATED && (
              <DropdownMenuItem
                variant="destructive"
                onClick={() => {
                  setIsDeleteOpen(true)
                }}
              >
                <Trash />
                Delete
              </DropdownMenuItem>
            )}
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <UserMenuItems />
        </DropdownMenuContent>
      </DropdownMenu>
      <DeletePhotoDialog
        photo={props.photo}
        album={props.album}
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
      />
      {props.album && (
        <RemovePhotoFromAlbumDialog
          photo={props.photo}
          album={props.album}
          open={isRemoveOpen}
          onOpenChange={setIsRemoveOpen}
        />
      )}
    </>
  )
}
