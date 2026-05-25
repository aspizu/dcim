import {Link} from "@tanstack/react-router"

import {ImgFaded} from "#components/img-faded"
import {groupPhotosByDate} from "#lib/dates"
import type * as api from "#services/api"

function Photo(props: {photo: api.Photo; album?: api.Album}) {
  return (
    <Link
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
          className="absolute inset-0 h-full w-full object-cover"
        />
      </div>
    </Link>
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
