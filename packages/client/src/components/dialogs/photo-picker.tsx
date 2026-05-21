import {useRef} from "react"

import {ImgFaded} from "#components/img-faded"
import {Button} from "#components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "#components/ui/dialog"
import {useQueryPhotos} from "#hooks/queries"
import {useOnScrollEnd} from "#hooks/use-on-scroll-end"
import type {Photo} from "#services/api"
import type * as api from "#services/api"

function Photo(props: {photo: api.Photo}) {
  return (
    <div className="relative aspect-square overflow-hidden rounded-md">
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
        className="absolute inset-0 h-full w-full object-cover"
      />
    </div>
  )
}

export function PhotoGrid() {
  const ref = useRef<HTMLDivElement>(null)
  const photos = useQueryPhotos()
  useOnScrollEnd(photos.fetchNextPage, ref)
  const allPhotos = photos.data.pages.reduce(
    (prev: Photo[], cur) => [...prev, ...cur.photos],
    [],
  )
  return (
    <div ref={ref} className="grid overflow-y-scroll">
      <div className="grid grid-cols-3 gap-2">
        {allPhotos.map((photo) => (
          <Photo photo={photo} />
        ))}
      </div>
    </div>
  )
}

export function PhotoPicker() {
  return (
    <Dialog open={true}>
      <DialogContent className="max-h-[80%]">
        <DialogHeader>
          <DialogTitle>Add photos</DialogTitle>
        </DialogHeader>
        <PhotoGrid />
        <DialogFooter>
          <Button>Add</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
