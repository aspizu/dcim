import {prepareFileUpload} from "#lib/uploads"
import * as api from "#services/api"
import {$uploadState} from "#stores/upload"
import {signal} from "@preact/signals-react"
import axios from "axios"
import {useState} from "react"
import {Button} from "./ui/button"
import {Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle} from "./ui/dialog"
import {Spinner} from "./ui/spinner"
import {UploadDialogItem} from "./upload-dialog-item"

export const $uploadDialogOpen = signal(false)

export function UploadDialog() {
  const items = [...$uploadState.value]
  const len = items.length
  items.sort((a, b) => a.handle.name.localeCompare(b.handle.name))
  const [progress, setProgress] = useState<Record<string, number> | null>(null)
  async function onUploadClick() {
    const progress = Object.fromEntries(items.map((item) => [item.id, 0]))
    setProgress(progress)
    for (const item of items) {
      const prepared = await prepareFileUpload(item.handle)
      const res1 = await axios.put(prepared.imagePresignedURL, prepared.file, {
        headers: {
          "Content-Type": prepared.file.type,
          "x-amz-checksum-sha256": prepared.contentSHA256,
          "Cache-Control": "public, max-age=31536000, immutable, no-transform",
          "Content-Disposition": `attachment; filename=${JSON.stringify(prepared.file.name)}`,
        },
        onUploadProgress(e) {
          progress[item.id] = (e.loaded / e.total!) * 75
          setProgress({...progress})
        },
      })
      if (res1.status !== 200) {
        console.error("Failed to upload image", res1.status, res1.data)
        return
      }
      const res2 = await axios.put(prepared.thumbnailPresignedURL, prepared.thumbnail, {
        headers: {
          "Content-Type": "image/avif",
          "x-amz-checksum-sha256": prepared.thumbnailContentSHA256,
          "Cache-Control": "public, max-age=31536000, immutable, no-transform",
          "Content-Disposition": `attachment; filename=${JSON.stringify(prepared.file.name.replace(/\.[^.]+$/, ".avif"))}`,
        },
        onUploadProgress(e) {
          progress[item.id] = 75 + (e.loaded / e.total!) * 25
          setProgress({...progress})
        },
      })
      if (res2.status !== 200) {
        console.error("Failed to upload thumbnail", res2.status, res2.data)
        return
      }
      await api.confirmPhotoUploaded({id: prepared.id})
    }
    $uploadDialogOpen.value = false
  }

  return (
    <Dialog
      open={$uploadDialogOpen.value}
      onOpenChange={(value) => {
        if (progress !== null) {
          return
        }
        $uploadDialogOpen.value = value
      }}
    >
      <DialogContent showCloseButton={progress === null}>
        <DialogHeader>
          <DialogTitle>Upload Photos</DialogTitle>
        </DialogHeader>

        <div className="flex max-h-[80dvh] flex-col gap-2 overflow-y-auto">
          {items.map((item) => (
            <UploadDialogItem
              key={item.id}
              {...item}
              progress={progress === null ? null : progress[item.id]}
            />
          ))}
        </div>

        <DialogFooter>
          <Button onClick={() => void onUploadClick()} disabled={progress !== null}>
            {progress == null ?
              <>
                Upload {len > 1 && len} Photo{len > 1 && "s"}
              </>
            : <>
                <Spinner /> Uploading
              </>
            }
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
