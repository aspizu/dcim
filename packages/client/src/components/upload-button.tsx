import {$uploadState} from "#stores/upload"
import {batch} from "@preact/signals-react"
import {Plus} from "lucide-react"
import {fromAsyncThrowable} from "neverthrow"
import {useState} from "react"
import {showOpenFilePicker} from "show-open-file-picker"
import * as uuid from "uuid"
import {Button} from "./ui/button"
import {Spinner} from "./ui/spinner"
import {$uploadDialogOpen, UploadDialog} from "./upload-dialog"

const tryShowOpenFilePicker = fromAsyncThrowable(showOpenFilePicker)

export function UploadButton() {
  const [isLoading, setIsLoading] = useState(false)
  async function onClick() {
    setIsLoading(true)
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
    setIsLoading(false)
    if (handles.isErr()) return
    batch(() => {
      $uploadState.value = handles.value.map((handle) => ({id: uuid.v4(), handle}))
      $uploadDialogOpen.value = true
    })
  }
  return (
    <>
      <Button onClick={() => void onClick()}>
        {isLoading ?
          <Spinner />
        : <Plus />}
        Upload
      </Button>
      <UploadDialog />
    </>
  )
}
