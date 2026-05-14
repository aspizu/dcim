import {batch} from "@preact/signals-react"
import {useNavigate} from "@tanstack/react-router"
import {Album, ImagePlus, Images, Plus} from "lucide-react"
import {fromAsyncThrowable} from "neverthrow"
import {useState} from "react"
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
import {Spinner} from "./ui/spinner"

const tryShowOpenFilePicker = fromAsyncThrowable(showOpenFilePicker)

export function NewMenu(props: {isAlbumType?: boolean}) {
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()
  async function _onUploadPhotosClick() {
    setIsLoading(true)
    const handles = await tryShowOpenFilePicker({
      types: [{description: "Images", accept: {"image/*": [".png", ".gif", ".jpeg", ".jpg"]}}],
      excludeAcceptAllOption: true,
      multiple: true,
    })
    if (handles.isErr()) {
      setIsLoading(false)
      return
    }
    batch(() => {
      $uploadState.value = handles.value.map((handle) => ({id: uuid.v4(), handle}))
      $uploadDialogOpen.value = true
    })
    setIsLoading(false)
  }
  async function _onCreateAlbumClick() {
    setIsLoading(true)
    const res = await api.createAlbum({name: "Untitled"})
    await navigate({to: "/a/$album", params: {album: res.id}})
    setIsLoading(false)
  }
  function _onAddExistingClick() {
    throw new Error("Not implemented")
  }
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button disabled={isLoading}>
          {isLoading ? <Spinner /> : <Plus />}
          {props.isAlbumType ? "Add" : "New"}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-auto">
        <DropdownMenuGroup>
          <DropdownMenuItem onClick={() => void _onUploadPhotosClick()}>
            <Images />
            Upload photos...
          </DropdownMenuItem>
          {props.isAlbumType ? (
            <DropdownMenuItem onClick={_onAddExistingClick}>
              <ImagePlus />
              Add existing...
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem onClick={() => void _onCreateAlbumClick()}>
              <Album />
              Create album...
            </DropdownMenuItem>
          )}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
