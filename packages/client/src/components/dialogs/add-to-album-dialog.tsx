import {ImgFaded} from "#components/img-faded"
import {Button} from "#components/ui/button"
import {useQueryPhotos} from "#hooks/queries/photos"
import type * as api from "#services/api"
import {$addToAlbumDialogOpen, $addToAlbumSelection} from "#stores/album"

import {Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle} from "../ui/dialog"

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

export function AddToAlbumDialog(props: {album: api.Album}) {
  const photos = useQueryPhotos()
  const len = $addToAlbumSelection.value.length
  return (
    <Dialog
      open={$addToAlbumDialogOpen.value}
      onOpenChange={(value) => {
        $addToAlbumDialogOpen.value = value
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add photos to {props.album.name}</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-4 gap-2">
          {photos.data?.map((photo) => (
            <Photo key={photo.id} photo={photo} />
          ))}
        </div>
        <DialogFooter>
          <Button>
            Add {len > 1 && len} photo{len > 1 && "s"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
