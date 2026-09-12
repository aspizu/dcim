import {constants} from "@dcim/common"
import {useSignal} from "@preact/signals-react"
import {Upload} from "lucide-react"
import type {DragEvent, ReactNode} from "react"
import {toast} from "sonner"
import {v4 as uuid} from "uuid"

import {UploadDialog} from "#components/dialogs/upload-dialog"
import type {Album} from "#services/api"

type UploadBatch = {
  id: string
  files: {id: string; handle: File}[]
}

function _imageFile(file: File) {
  const type = file.type || constants.getImageMimeType(file.name)
  if (!type || !constants.isImageMimeType(type)) return
  return file.type ? file : new File([file], file.name, {type, lastModified: file.lastModified})
}

export function PhotoDropZone(props: {children: ReactNode; album?: Album}) {
  const $dragDepth = useSignal(0)
  const $batches = useSignal<UploadBatch[]>([])
  const batch = $batches.value[0]
  function _onOpenChange(open: boolean) {
    if (open) return
    $batches.value = $batches.value.slice(1)
  }
  function _onRemoveFileHandle(id: string) {
    $batches.value = $batches.value
      .map((batch) => ({...batch, files: batch.files.filter((file) => file.id !== id)}))
      .filter((batch) => batch.files.length > 0)
  }
  function _onDragEnter(event: DragEvent<HTMLDivElement>) {
    if (!event.dataTransfer.types.includes("Files")) return
    event.preventDefault()
    $dragDepth.value++
  }
  function _onDragLeave() {
    $dragDepth.value = Math.max(0, $dragDepth.value - 1)
  }
  function _onDragOver(event: DragEvent<HTMLDivElement>) {
    if (!event.dataTransfer.types.includes("Files")) return
    event.preventDefault()
    event.dataTransfer.dropEffect = "copy"
  }
  function _onDrop(event: DragEvent<HTMLDivElement>) {
    $dragDepth.value = 0
    if (!event.dataTransfer.types.includes("Files")) return
    event.preventDefault()
    const files = Array.from(event.dataTransfer.files)
    const images = files.map(_imageFile).filter((file) => file !== undefined)
    if (images.length === 0) {
      toast.error("Drop a supported image file to upload")
      return
    }
    const skipped = files.length - images.length
    if (skipped > 0) {
      toast.warning(`Skipped ${skipped} unsupported file${skipped === 1 ? "" : "s"}`)
    }
    $batches.value = [
      ...$batches.value,
      {id: uuid(), files: images.map((handle) => ({id: uuid(), handle}))},
    ]
  }
  return (
    <div
      className="min-h-dvh"
      onDragEnter={_onDragEnter}
      onDragLeave={_onDragLeave}
      onDragOver={_onDragOver}
      onDrop={_onDrop}
    >
      {props.children}
      {batch && (
        <UploadDialog
          key={batch.id}
          fileHandles={batch.files}
          album={props.album}
          open
          autoUpload
          onOpenChange={_onOpenChange}
          onRemoveFileHandle={_onRemoveFileHandle}
        />
      )}
      {$dragDepth.value > 0 && (
        <div
          className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center bg-background/90"
          role="status"
        >
          <div className="flex flex-col items-center gap-3 text-primary">
            <Upload className="size-12" />
            <span className="text-lg font-medium">I got it</span>
            <span className="text-sm text-muted-foreground">Drop to upload instantly</span>
          </div>
        </div>
      )}
    </div>
  )
}
