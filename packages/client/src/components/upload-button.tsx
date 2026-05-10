import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "#components/ui/dropdown-menu"
import {$uploadDialogOpen, $uploadState} from "#stores/upload"
import {batch} from "@preact/signals-react"
import {Album, Images, Plus} from "lucide-react"
import {fromAsyncThrowable} from "neverthrow"
import {showOpenFilePicker} from "show-open-file-picker"
import * as uuid from "uuid"
import {Button} from "./ui/button"
import {UploadDialog} from "./upload-dialog"

const tryShowOpenFilePicker = fromAsyncThrowable(showOpenFilePicker)

export function UploadButton() {
  async function _onUploadPhotosClick() {
    const handles = await tryShowOpenFilePicker({
      types: [
        {
          description: "Images",
          accept: {
            "image/*": [".png", ".gif", ".jpeg", ".jpg"],
          },
        },
      ],
      excludeAcceptAllOption: true,
      multiple: true,
    })
    if (handles.isErr()) return
    batch(() => {
      $uploadState.value = handles.value.map((handle) => ({id: uuid.v4(), handle}))
      $uploadDialogOpen.value = true
    })
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
            <DropdownMenuItem>
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
