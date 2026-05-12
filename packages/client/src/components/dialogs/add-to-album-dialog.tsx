import {useQueryClient} from "@tanstack/react-query"
import {CheckCircle2} from "lucide-react"
import {useState} from "react"

import {ImgFaded} from "#components/img-faded"
import {Button} from "#components/ui/button"
import {Spinner} from "#components/ui/spinner"
import {useQueryPhotos} from "#hooks/queries/photos"
import type * as api from "#services/api"
import * as apiClient from "#services/api"
import {$addToAlbumDialogOpen, $addToAlbumSelection} from "#stores/album"

import {Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle} from "../ui/dialog"

function Photo(props: {photo: api.Photo; selected: boolean; onToggle: () => void}) {
  return (
    <div
      className="relative aspect-square cursor-pointer overflow-hidden rounded-md"
      onClick={props.onToggle}
    >
      <img
        src={props.photo.thumbhash}
        alt={props.photo.file_name}
        className="absolute inset-0 h-full w-full scale-[1.05] object-cover blur-md"
        style={{aspectRatio: `${props.photo.width / props.photo.height}`}}
      />
      <ImgFaded
        src={props.photo.thumbnail_url}
        alt={props.photo.file_name}
        className="absolute inset-0 h-full w-full object-cover"
      />
      {props.selected && (
        <>
          <div className="absolute inset-0 bg-primary/20" />
          <div className="absolute inset-0 rounded-md border-2 border-primary" />
          <CheckCircle2 className="absolute top-1 right-1 size-5 fill-primary text-primary-foreground drop-shadow" />
        </>
      )}
    </div>
  )
}

export function AddToAlbumDialog(props: {album: api.AlbumWithPhotos}) {
  const photos = useQueryPhotos()
  const queryClient = useQueryClient()
  const [isLoading, setIsLoading] = useState(false)
  const albumPhotoIDs = new Set(props.album.photos.map((p) => p.id))
  const availablePhotos = photos.data?.filter((p) => !albumPhotoIDs.has(p.id)) ?? []
  const len = $addToAlbumSelection.value.length

  function _toggle(id: string) {
    const sel = $addToAlbumSelection.value
    $addToAlbumSelection.value = sel.includes(id) ? sel.filter((x) => x !== id) : [...sel, id]
  }

  async function _onAdd() {
    setIsLoading(true)
    const ids = $addToAlbumSelection.value
    await Promise.all(
      ids.map((photoID) => apiClient.addPhotoToAlbum({id: props.album.id, photoID})),
    )
    const addedPhotos = availablePhotos.filter((p) => ids.includes(p.id))
    queryClient.setQueryData(["album", props.album.id], (old: api.AlbumWithPhotos) => ({
      ...old,
      photos: [...old.photos, ...addedPhotos],
    }))
    $addToAlbumSelection.value = []
    $addToAlbumDialogOpen.value = false
    setIsLoading(false)
  }

  return (
    <Dialog
      open={$addToAlbumDialogOpen.value}
      onOpenChange={(value) => {
        if (!value) {
          $addToAlbumSelection.value = []
        }
        $addToAlbumDialogOpen.value = value
      }}
    >
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add photos to {props.album.name}</DialogTitle>
        </DialogHeader>
        <div className="grid max-h-[60vh] grid-cols-4 gap-2 overflow-y-auto">
          {availablePhotos.map((photo) => (
            <Photo
              key={photo.id}
              photo={photo}
              selected={$addToAlbumSelection.value.includes(photo.id)}
              onToggle={() => _toggle(photo.id)}
            />
          ))}
          {availablePhotos.length === 0 && (
            <p className="col-span-4 py-8 text-center text-muted-foreground">
              No photos to add
            </p>
          )}
        </div>
        <DialogFooter>
          <Button disabled={len === 0 || isLoading} onClick={() => void _onAdd()}>
            {isLoading && <Spinner />}
            Add {len > 0 && len} photo{len !== 1 && "s"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
