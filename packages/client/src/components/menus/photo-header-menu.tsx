import {constants} from "@dcim/common"
import {Code, Copy, Download, Ellipsis, LinkIcon, Pencil, Trash, X} from "lucide-react"
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
import {photoHtml, photoMarkdown} from "#utils/photo-markup"

import {DeletePhotoDialog, RemovePhotoFromAlbumDialog} from "../dialogs"
import {UserMenuItems} from "./user-menu-items"

export function PhotoHeaderMenu(props: {
  photo: Photo
  album?: Album
  onEditCaption: () => void
}) {
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [isRemoveFromAlbumOpen, setRemoveFromAlbumOpen] = useState(false)
  const isAuthenticated = $authState.value === AuthState.AUTHENTICATED
  async function _copyText(text: string, message: string) {
    try {
      await navigator.clipboard.writeText(text)
      toast(message)
    } catch {
      toast.error("Copy failed")
    }
  }
  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="solid" size="icon">
            <Ellipsis />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="min-w-38">
          <DropdownMenuGroup>
            <DropdownMenuItem
              onClick={() => {
                void _copyText(props.photo.image_url, "Copied link to clipboard")
              }}
            >
              <LinkIcon />
              Copy link
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                void _copyText(photoMarkdown(props.photo), "Copied Markdown to clipboard")
              }}
            >
              <Copy />
              Copy Markdown
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                void _copyText(photoHtml(props.photo), "Copied HTML to clipboard")
              }}
            >
              <Code />
              Copy HTML
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <a href={props.photo.image_url} download>
                <Download />
                Download
              </a>
            </DropdownMenuItem>
            {isAuthenticated && !constants.isVideoExtension(props.photo.file_name) && (
              <DropdownMenuItem onClick={props.onEditCaption}>
                <Pencil />
                Edit Caption
              </DropdownMenuItem>
            )}
            {isAuthenticated && props.album && (
              <DropdownMenuItem
                onClick={() => {
                  setRemoveFromAlbumOpen(true)
                }}
              >
                <X />
                Remove
              </DropdownMenuItem>
            )}
            {isAuthenticated && (
              <DropdownMenuItem
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
          open={isRemoveFromAlbumOpen}
          onOpenChange={setRemoveFromAlbumOpen}
        />
      )}
    </>
  )
}
