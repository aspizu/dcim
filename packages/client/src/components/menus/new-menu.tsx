import {useNavigate} from "@tanstack/react-router"
import {AlbumIcon, ImagePlus, Images, Plus} from "lucide-react"
import {fromAsyncThrowable} from "neverthrow"
import {useState} from "react"
import {showOpenFilePicker} from "show-open-file-picker"
import * as uuid from "uuid"

import {AddPhotoToAlbumDialog} from "#components/dialogs/add-photo-to-album-dialog"
import {UploadDialog} from "#components/dialogs/upload-dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "#components/ui/dropdown-menu"
import {useCreateAlbum} from "#hooks/mutations"
import type {Album} from "#services/api"

import {Button} from "../ui/button"
import {Spinner} from "../ui/spinner"

const tryShowOpenFilePicker = fromAsyncThrowable(showOpenFilePicker)

export function NewMenu(props: {album?: Album}) {
  const [isLoading, setIsLoading] = useState(false)
  const [isUploadOpen, setIsUploadOpen] = useState(false)
  const [isAddExistingOpen, setIsAddExistingOpen] = useState(false)
  const [fileHandles, setFileHandles] = useState<
    {
      id: string
      handle: FileSystemFileHandle
    }[]
  >([])
  const navigate = useNavigate()
  const createAlbum = useCreateAlbum()
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
    setFileHandles(handles.value.map((handle) => ({id: uuid.v4(), handle})))
    setIsUploadOpen(true)
    setIsLoading(false)
  }
  function _onAddExistingClick() {
    setIsAddExistingOpen(true)
  }
  function _onRemoveFileHandle(id: string) {
    const nextFileHandles = fileHandles.filter((item) => item.id !== id)
    setFileHandles(nextFileHandles)
    if (nextFileHandles.length === 0) {
      setIsUploadOpen(false)
    }
  }
  async function _onCreateAlbumClick() {
    const res = await createAlbum.mutateAsync("Untitled")
    await navigate({to: "/a/$album", params: {album: res.id}})
  }
  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button disabled={isLoading || createAlbum.isPending}>
            {isLoading || createAlbum.isPending ? <Spinner /> : <Plus />}
            {props.album ? "Add" : "New"}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-auto">
          <DropdownMenuGroup>
            <DropdownMenuItem onClick={() => void _onUploadPhotosClick()}>
              <Images />
              Upload photos...
            </DropdownMenuItem>
            {props.album ? (
              <DropdownMenuItem onClick={_onAddExistingClick}>
                <ImagePlus />
                Add existing...
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem onClick={() => void _onCreateAlbumClick()}>
                <AlbumIcon />
                Create album...
              </DropdownMenuItem>
            )}
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
      <UploadDialog
        open={isUploadOpen}
        onOpenChange={setIsUploadOpen}
        onRemoveFileHandle={_onRemoveFileHandle}
        album={props.album}
        fileHandles={fileHandles}
      />
      {props.album && (
        <AddPhotoToAlbumDialog
          album={props.album}
          open={isAddExistingOpen}
          onOpenChange={setIsAddExistingOpen}
        />
      )}
    </>
  )
}
