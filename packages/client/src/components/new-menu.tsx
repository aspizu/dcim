import {batch} from "@preact/signals-react"
import {useNavigate} from "@tanstack/react-router"
import {Album, Images, Plus} from "lucide-react"
import {fromAsyncThrowable} from "neverthrow"
import {showOpenFilePicker} from "show-open-file-picker"
import * as uuid from "uuid"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "#components/ui/dropdown-menu"
import * as api from "#services/api"
import {$uploadDialogOpen, $uploadState} from "#stores/upload"

import {Button} from "./ui/button"
import {UploadDialog} from "./upload-dialog"

const tryShowOpenFilePicker = fromAsyncThrowable(showOpenFilePicker)

export function NewMenu() {
  const navigate = useNavigate()
  async function _onUploadPhotosClick() {
    const handles = await tryShowOpenFilePicker({
      types: [{description: "Images", accept: {"image/*": [".png", ".gif", ".jpeg", ".jpg"]}}],
      excludeAcceptAllOption: true,
      multiple: true,
    })
    if (handles.isErr()) return
    batch(() => {
      $uploadState.value = handles.value.map((handle) => ({id: uuid.v4(), handle}))
      $uploadDialogOpen.value = true
    })
  }
  async function _onCreateAlbumClick() {
    const res = await api.createAlbum({name: "Untitled"})
    await navigate({to: "/a/$album", params: {album: res.id}})
  }
  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button>
            <Plus />
            New
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-auto">
          <DropdownMenuGroup>
            <DropdownMenuItem onClick={() => void _onUploadPhotosClick()}>
              <Images />
              Upload photos...
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => void _onCreateAlbumClick()}>
              <Album />
              Create album...
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
      <UploadDialog />
    </>
  )
}
