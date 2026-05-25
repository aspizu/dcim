import {Check} from "lucide-react"
import {Suspense, useRef} from "react"

import {ImgFaded} from "#components/img-faded"
import {Button} from "#components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "#components/ui/dialog"
import {Spinner} from "#components/ui/spinner"
import {useAddPhotoToAlbum, useRemovePhotoFromAlbum} from "#hooks/mutations"
import {useQueryPhotosByAlbum} from "#hooks/queries"
import {useOnScrollEnd} from "#hooks/use-on-scroll-end"
import {cn} from "#lib/utils"
import type * as api from "#services/api"
import {$editAlbumAdditions, $editAlbumDeletions, resetEditAlbumStore} from "#stores/album"

function Photo(props: {
  photo: api.Photo & {in_album: boolean}
  setSelected: (value: boolean) => void
}) {
  const selected =
    $editAlbumAdditions.value.includes(props.photo.id) ||
    (props.photo.in_album && !$editAlbumDeletions.value.includes(props.photo.id))
  return (
    <div
      className="relative aspect-square overflow-hidden rounded-md"
      role="button"
      aria-selected={selected ? "true" : "false"}
      onClick={() => {
        props.setSelected(!selected)
      }}
    >
      <img
        src={props.photo.thumbhash}
        alt={props.photo.file_name}
        className="absolute inset-0 h-full w-full scale-[1.05] object-cover blur-md"
        style={{
          aspectRatio: `${props.photo.width / props.photo.height}`,
        }}
      />
      <ImgFaded
        src={props.photo.thumbnail_url}
        alt={props.photo.file_name}
        className={cn(
          "absolute inset-0 h-full w-full object-cover transition-all",
          selected && "brightness-50",
        )}
      />
      <div
        className={cn(
          "absolute right-1 bottom-1 grid size-6 place-items-center rounded-md bg-primary transition-opacity",
          selected ? "opacity-100" : "opacity-0",
        )}
      >
        <Check className="size-4 text-primary-foreground" />
      </div>
    </div>
  )
}

export function PhotoGrid(props: {album: string}) {
  const ref = useRef<HTMLDivElement>(null)
  const photos = useQueryPhotosByAlbum(props.album)
  useOnScrollEnd(photos.fetchNextPage, ref)
  const allPhotos = photos.data.pages.reduce(
    (prev: (api.Photo & {in_album: boolean})[], cur) => [...prev, ...cur.photos],
    [],
  )
  return (
    <div ref={ref} className="grow overflow-y-scroll">
      <div className="grid grid-cols-3 gap-2">
        {allPhotos.map((photo) => (
          <Photo
            key={photo.id}
            photo={photo}
            setSelected={(value) => {
              if (photo.in_album) {
                if (value === false && !$editAlbumDeletions.value.includes(photo.id)) {
                  $editAlbumDeletions.value = [...$editAlbumDeletions.value, photo.id]
                }
                if (value === true && $editAlbumDeletions.value.includes(photo.id)) {
                  $editAlbumDeletions.value = $editAlbumDeletions.value.filter(
                    (p) => p !== photo.id,
                  )
                }
              } else {
                if (value === true && !$editAlbumAdditions.value.includes(photo.id)) {
                  $editAlbumAdditions.value = [...$editAlbumAdditions.value, photo.id]
                }
                if (value === false && $editAlbumAdditions.value.includes(photo.id)) {
                  $editAlbumAdditions.value = $editAlbumAdditions.value.filter(
                    (p) => p !== photo.id,
                  )
                }
              }
            }}
          />
        ))}
      </div>
    </div>
  )
}

export function AddPhotoToAlbumDialog(props: {
  album: api.Album
  open: boolean
  onOpenChange: (value: boolean) => void
}) {
  const addPhotoToAlbum = useAddPhotoToAlbum(props.album.id)
  const removePhotoFromAlbum = useRemovePhotoFromAlbum(props.album.id)
  async function _onSaveClick() {
    await Promise.all([
      ...$editAlbumAdditions.value.map((photo) => addPhotoToAlbum.mutateAsync(photo)),
      ...$editAlbumDeletions.value.map((photo) => removePhotoFromAlbum.mutateAsync(photo)),
    ])
    resetEditAlbumStore()
    props.onOpenChange(false)
  }
  return (
    <Dialog
      open={props.open}
      onOpenChange={(value) => {
        props.onOpenChange(value)
        if (!value) {
          resetEditAlbumStore()
        }
      }}
    >
      <DialogContent className="flex h-[80%] flex-col">
        <DialogHeader>
          <DialogTitle>Add photos</DialogTitle>
        </DialogHeader>
        <Suspense
          fallback={
            <div className="grid grow place-items-center">
              <Spinner />
            </div>
          }
        >
          <PhotoGrid album={props.album.id} />
        </Suspense>
        <DialogFooter>
          <Button
            disabled={addPhotoToAlbum.isPending || removePhotoFromAlbum.isPending}
            onClick={() => void _onSaveClick()}
          >
            {(addPhotoToAlbum.isPending || removePhotoFromAlbum.isPending) && <Spinner />}
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
