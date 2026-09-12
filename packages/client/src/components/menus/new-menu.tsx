import {constants} from "@dcim/common"
import {useNavigate} from "@tanstack/react-router"
import {AlbumIcon, ImagePlus, Images, Plus} from "lucide-react"
import {fromAsyncThrowable} from "neverthrow"
import {useState} from "react"
import {showOpenFilePicker} from "show-open-file-picker"
import {toast} from "sonner"
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
      handle: File
    }[]
  >([])
  const navigate = useNavigate()
  const createAlbum = useCreateAlbum()
  async function _onUploadPhotosClick() {
    setIsLoading(true)
    const handles = await tryShowOpenFilePicker({
      types: [
        {
          description: "Images",
          accept: Object.fromEntries(
            Object.entries(constants.IMAGE_MIME_TYPES).map(([type, extensions]) => [
              type,
              [...extensions],
            ]),
          ),
        },
      ],
      excludeAcceptAllOption: true,
      multiple: true,
    })
    if (handles.isErr()) {
      setIsLoading(false)
      return
    }
    const results = await Promise.allSettled(handles.value.map((handle) => handle.getFile()))
    const files = results
      .map((result) => {
        if (result.status !== "fulfilled") return
        const file = result.value
        const type = file.type || constants.getImageMimeType(file.name)
        if (!type || !constants.isImageMimeType(type)) return
        return file.type
          ? file
          : new File([file], file.name, {type, lastModified: file.lastModified})
      })
      .filter((file) => file !== undefined)
    setIsLoading(false)
    if (files.length === 0) {
      toast.error("No supported image files could be opened")
      return
    }
    const skipped = results.length - files.length
    if (skipped > 0) {
      toast.warning(
        `Skipped ${skipped} unsupported or unreadable file${skipped === 1 ? "" : "s"}`,
      )
    }
    setFileHandles(files.map((handle) => ({id: uuid.v4(), handle})))
    setIsUploadOpen(true)
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
              <DropdownMenuItem
                onClick={() => void _onCreateAlbumClick()}
                disabled={createAlbum.isPending}
              >
                {createAlbum.isPending ? <Spinner /> : <AlbumIcon />}
                Create album
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
