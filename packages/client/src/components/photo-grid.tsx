import {Link} from "@tanstack/react-router"
import {useEffect, useRef} from "react"

import {ImgFaded} from "#components/img-faded"
import {PhotoCheckbox} from "#components/photo-checkbox"
import {groupPhotosByDate} from "#lib/dates"
import type * as api from "#services/api"
import {getSelectedPhotoIDs, isMultiSelectionMode, setPhotoSelected} from "#stores/photo-grid"

function Photo(props: {photo: api.Photo; album?: api.Album}) {
  const galleryKey = props.album?.id ?? "/"
  const holdTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const suppressClick = useRef(false)
  function _cancelHold(): void {
    clearTimeout(holdTimer.current)
    holdTimer.current = undefined
  }
  useEffect(() => _cancelHold, [])
  return (
    <div
      data-selected={getSelectedPhotoIDs(galleryKey).includes(props.photo.id)}
      className="group/photo relative rounded-md"
    >
      <Link
        className="select-none [-webkit-touch-callout:none]"
        onTouchStart={(event) => {
          _cancelHold()
          suppressClick.current = false
          if (event.touches.length !== 1) return
          holdTimer.current = setTimeout(() => {
            holdTimer.current = undefined
            suppressClick.current = true
            setPhotoSelected(galleryKey, props.photo.id, true)
          }, 500)
        }}
        onTouchMove={_cancelHold}
        onTouchEnd={_cancelHold}
        onTouchCancel={_cancelHold}
        onContextMenu={(event) => {
          if (holdTimer.current !== undefined || suppressClick.current) {
            event.preventDefault()
          }
        }}
        onClick={(event) => {
          if (suppressClick.current) {
            suppressClick.current = false
            event.preventDefault()
            return
          }
          if (!isMultiSelectionMode(galleryKey)) return
          event.preventDefault()
          setPhotoSelected(
            galleryKey,
            props.photo.id,
            !getSelectedPhotoIDs(galleryKey).includes(props.photo.id),
          )
        }}
        to={props.album ? `/a/$album/p/$photo` : `/p/$photo`}
        params={
          props.album ? {album: props.album.id, photo: props.photo.id} : {photo: props.photo.id}
        }
      >
        <div
          className="relative aspect-square overflow-hidden rounded-md"
          style={{
            viewTransitionName: `photo-${props.photo.id}`,
          }}
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
            className="absolute inset-0 h-full w-full object-cover transition-all group-data-[selected=true]/photo:brightness-50"
          />
        </div>
      </Link>
      <PhotoCheckbox
        checked={getSelectedPhotoIDs(galleryKey).includes(props.photo.id)}
        onCheckedChange={(checked) => {
          setPhotoSelected(galleryKey, props.photo.id, checked)
        }}
        label={`Select ${props.photo.file_name}`}
      />
    </div>
  )
}

export function PhotoGrid(props: {photos: api.Photo[]; album?: api.Album}) {
  const groups = groupPhotosByDate(props.photos)
  return (
    <div className="flex flex-col">
      {groups.map(([key, photos]) => (
        <div key={key} className="group flex flex-col">
          <h2 className="mb-2 text-sm font-medium not-group-first:mt-4">{key}</h2>
          <div className="grid grid-cols-3 gap-2">
            {photos?.map((photo) => (
              <Photo key={photo.id} photo={photo} album={props.album} />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
