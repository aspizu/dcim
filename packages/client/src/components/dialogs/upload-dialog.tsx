import {useQueryClient} from "@tanstack/react-query"
import {useState} from "react"

import {completeFileUpload, prepareFileUpload} from "#lib/uploads"
import * as api from "#services/api"
import {$uploadDialogOpen, $uploadState} from "#stores/upload"

import {Button} from "../ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog"
import {Spinner} from "../ui/spinner"
import {UploadDialogItem} from "./upload-dialog-item"

function UploadStatus(props: {progress: Record<string, number>; total: number}) {
  const done = Object.values(props.progress).filter((v) => v >= 100).length
  const left = props.total - done
  return (
    <span className="mr-auto font-medium text-muted-foreground">
      {done} of {props.total} done{left > 0 && `, ${left} left`}
    </span>
  )
}

export function UploadDialog(props: {album?: api.Album}) {
  const items = [...$uploadState.value]
  const len = items.length
  items.sort((a, b) => a.handle.name.localeCompare(b.handle.name))
  const [progress, setProgress] = useState<Record<string, number> | null>(null)
  const queryClient = useQueryClient()
  async function _onUploadClick() {
    const preparedPhotos = []
    for (const item of items) {
      const prepared = await prepareFileUpload(item.handle)
      preparedPhotos.push({id: item.id, prepared})
    }
    setProgress(Object.fromEntries(items.map((item) => [item.id, 0])))
    for (const {id, prepared} of preparedPhotos) {
      document.getElementById(`upload-item-${id}`)?.scrollIntoView({behavior: "smooth"})
      const photoID = await completeFileUpload(prepared, id, (id, value) => {
        setProgress((progress) => ({...progress, [id]: value}))
      })
      if (props.album && photoID) {
        await api.addPhotoToAlbum({id: props.album.id, photoID})
      }
    }
    void queryClient.invalidateQueries({queryKey: ["photo"]})
    if (props.album) {
      void queryClient.invalidateQueries({queryKey: ["album", props.album.id]})
    }
    $uploadDialogOpen.value = false
  }
  return (
    <Dialog
      open={$uploadDialogOpen.value}
      onOpenChange={(value) => {
        if (progress !== null) return
        $uploadDialogOpen.value = value
      }}
    >
      <DialogContent showCloseButton={progress === null}>
        <DialogHeader>
          <DialogTitle>Upload photos</DialogTitle>
          {props.album && (
            <DialogDescription>
              Uploaded photos will be added to the album {props.album.name}
            </DialogDescription>
          )}
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
        <DialogFooter className="flex items-center">
          {progress !== null && <UploadStatus progress={progress} total={len} />}
          <Button onClick={() => void _onUploadClick()} disabled={progress !== null}>
            {progress == null ? (
              <>
                Upload {len > 1 && len} photo{len > 1 && "s"}
              </>
            ) : (
              <>
                <Spinner /> Uploading
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
