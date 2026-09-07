import _ from "lodash"
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

import {DeletePhotoDialog, RemovePhotoFromAlbumDialog} from "../dialogs"
import {UserMenuItems} from "./user-menu-items"

export function PhotoHeaderMenu(props: {
  photo: Photo
  album?: Album
  setCaptionEditable: (value: boolean) => void
}) {
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [isRemoveOpen, setIsRemoveOpen] = useState(false)
  async function _copyAsMarkdown() {
    const alt = props.photo.file_name.replace(/[\\`*_[\]<>!&]/g, "\\$&").replace(/\s+/g, " ")
    const url = props.photo.image_url.replace(/[<>\s\\]/g, encodeURIComponent)
    try {
      await navigator.clipboard.writeText(`![${alt}](<${url}>)`)
      toast("Copied Markdown to clipboard")
    } catch {
      return
    }
  }
  async function _copyAsHtml() {
    const src = _.escape(props.photo.image_url)
    const alt = _.escape(props.photo.file_name)
    try {
      await navigator.clipboard.writeText(
        `<img src="${src}" alt="${alt}" width="${props.photo.width}" height="${props.photo.height}" loading="lazy">`,
      )
      toast("Copied HTML to clipboard")
    } catch {
      return
    }
  }
  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <Ellipsis />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="min-w-38">
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
            <DropdownMenuItem onClick={() => void _copyAsMarkdown()}>
              <Copy />
              Copy Markdown
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => void _copyAsHtml()}>
              <Code />
              Copy HTML
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
                  props.setCaptionEditable(true)
                }}
              >
                <Pencil />
                Edit Caption
              </DropdownMenuItem>
            )}
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
