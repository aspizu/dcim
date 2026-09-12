import {useSignal} from "@preact/signals-react"
import {useQueryClient} from "@tanstack/react-query"
import {useLocation, useNavigate} from "@tanstack/react-router"
import {useEffect, useEffectEvent} from "react"

import {completeFileUpload, prepareFileUpload} from "#lib/uploads"
import * as api from "#services/api"

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
import {UploadDialogItem, type UploadItemProgress} from "./upload-dialog-item"

function UploadStatus(props: {progress: Record<string, UploadItemProgress>; total: number}) {
  const values = Object.values(props.progress)
  const done = values.filter((v) => v.percent >= 100 && !v.failed).length
  const failedCount = values.filter((v) => v.failed).length
  const left = props.total - done - failedCount
  return (
    <span className="mr-auto font-medium text-muted-foreground">
      {done} of {props.total} done
      {failedCount > 0 && `, ${failedCount} failed`}
      {left > 0 && `, ${left} left`}
    </span>
  )
}

export function UploadDialog(props: {
  fileHandles: {id: string; handle: FileSystemFileHandle | File}[]
  open: boolean
  onOpenChange: (value: boolean) => void
  onRemoveFileHandle: (id: string) => void
  album?: api.Album
  autoUpload?: boolean
}) {
  const items = [...props.fileHandles]
  const len = items.length
  items.sort((a, b) => a.handle.name.localeCompare(b.handle.name))
  const $progress = useSignal<Record<string, UploadItemProgress> | null>(null)
  const $uploading = useSignal(false)
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const location = useLocation()
  async function _onUploadClick() {
    if ($progress.value !== null || len === 0) return
    $uploading.value = true
    $progress.value = Object.fromEntries(
      items.map((item) => [item.id, {percent: 0, failed: false}]),
    )
    let hasFailed = false
    let photoID: string | undefined
    for (const {id, handle} of items) {
      document.getElementById(`upload-item-${id}`)?.scrollIntoView({behavior: "smooth"})
      try {
        const prepared = await prepareFileUpload(handle)
        photoID = await completeFileUpload(prepared, id, (id, state) => {
          $progress.value = {
            ...$progress.value,
            [id]: {percent: Math.min(99, state.percent), failed: state.failed},
          }
        })
        if (!photoID) {
          throw new Error("Upload failed")
        }
        if (props.album) {
          await api.addPhotoToAlbum({id: props.album.id, photoID})
        }
        $progress.value = {...$progress.value, [id]: {percent: 100, failed: false}}
      } catch {
        hasFailed = true
        $progress.value = {
          ...$progress.value,
          [id]: {percent: $progress.value?.[id]?.percent ?? 0, failed: true},
        }
      }
    }
    void queryClient.invalidateQueries({queryKey: ["photo"]})
    void queryClient.invalidateQueries({queryKey: ["storage"]})
    if (props.album) {
      void queryClient.invalidateQueries({queryKey: ["album", props.album.id]})
    }
    $uploading.value = false
    if (hasFailed) return
    props.onOpenChange(false)
    if (len === 1) {
      if (props.album) {
        await navigate({
          to: "/a/$album/p/$photo",
          params: {album: props.album.id, photo: photoID!},
        })
      } else {
        await navigate({to: "/p/$photo", params: {photo: photoID!}})
      }
    } else if (!props.autoUpload && location.pathname === "/albums") {
      await navigate({to: "/"})
    }
  }
  const _autoUpload = useEffectEvent(() => {
    void _onUploadClick()
  })
  useEffect(() => {
    if (!props.open) {
      $progress.value = null
    } else if (props.autoUpload) {
      _autoUpload()
    }
  }, [$progress, props.open, props.autoUpload])
  const progress = $progress.value
  const uploading = $uploading.value
  return (
    <Dialog
      open={props.open}
      onOpenChange={(open) => {
        if (!open && uploading) return
        props.onOpenChange(open)
      }}
    >
      <DialogContent showCloseButton={!uploading}>
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
              id={item.id}
              handle={item.handle}
              progress={progress === null ? null : progress[item.id]}
              onRemove={props.onRemoveFileHandle}
            />
          ))}
        </div>
        <DialogFooter className="flex items-center">
          {progress !== null && <UploadStatus progress={progress} total={len} />}
          <Button
            onClick={() => {
              if (progress === null) {
                void _onUploadClick()
              } else {
                props.onOpenChange(false)
              }
            }}
            disabled={uploading || len === 0}
          >
            {progress == null ? (
              <>
                Upload {len > 1 && len} photo{len > 1 && "s"}
              </>
            ) : uploading ? (
              <>
                <Spinner /> Uploading
              </>
            ) : (
              "Close"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
