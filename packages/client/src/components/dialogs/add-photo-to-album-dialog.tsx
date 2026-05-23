import {Check} from "lucide-react"
import {Suspense, useRef, useState} from "react"

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
import {useAddPhotoToAlbum} from "#hooks/mutations"
import {useQueryPhotosByAlbum} from "#hooks/queries"
import {useOnScrollEnd} from "#hooks/use-on-scroll-end"
import {cn} from "#lib/utils"
import type {Photo} from "#services/api"
import type * as api from "#services/api"

function Photo(props: {
  photo: api.Photo
  selected: boolean
  setSelected: (value: boolean) => void
}) {
  return (
    <div
      className="relative aspect-square overflow-hidden rounded-md"
      role="button"
      aria-selected={props.selected ? "true" : "false"}
      onClick={() => {
        props.setSelected(!props.selected)
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
          props.selected && "brightness-50",
        )}
      />
      <div
        className={cn(
          "absolute right-1 bottom-1 grid size-6 place-items-center rounded-md bg-primary transition-opacity",
          props.selected ? "opacity-100" : "opacity-0",
        )}
      >
        <Check className="size-4 text-primary-foreground" />
      </div>
    </div>
  )
}

export function PhotoGrid(props: {
  album: string
  selected: string[]
  setSelected: (value: string[]) => void
}) {
  const ref = useRef<HTMLDivElement>(null)
  const photos = useQueryPhotosByAlbum(props.album)
  useOnScrollEnd(photos.fetchNextPage, ref)
  const allPhotos = photos.data.pages.reduce(
    (prev: (Photo & {in_album: boolean})[], cur) => [...prev, ...cur.photos],
    [],
  )
  return (
    <div ref={ref} className="grid overflow-y-scroll">
      <div className="grid grid-cols-3 gap-2">
        {allPhotos.map((photo) => (
          <Photo
            key={photo.id}
            photo={photo}
            selected={props.selected.includes(photo.id) || photo.in_album}
            setSelected={(value) => {
              const selected = new Set(props.selected)
              if (value) {
                selected.add(photo.id)
              } else {
                selected.delete(photo.id)
              }
              props.setSelected([...selected])
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
  const [selected, setSelected] = useState<string[]>([])
  const addPhotoToAlbum = useAddPhotoToAlbum(props.album.id)
  async function _onAddClick() {
    await Promise.all(selected.map((photo) => addPhotoToAlbum.mutateAsync(photo)))
    setSelected([])
    props.onOpenChange(false)
  }
  return (
    <Dialog
      open={props.open}
      onOpenChange={(value) => {
        props.onOpenChange(value)
        if (!value) {
          setSelected([])
        }
      }}
    >
      <DialogContent className="h-[80%]">
        <DialogHeader>
          <DialogTitle>Add photos</DialogTitle>
        </DialogHeader>
        <Suspense fallback={<Spinner />}>
          <PhotoGrid album={props.album.id} selected={selected} setSelected={setSelected} />
        </Suspense>
        <DialogFooter>
          <Button
            disabled={selected.length === 0 || addPhotoToAlbum.isPending}
            onClick={() => void _onAddClick()}
          >
            {addPhotoToAlbum.isPending && <Spinner />}
            Add
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
