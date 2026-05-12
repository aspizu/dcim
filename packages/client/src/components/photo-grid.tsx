import {Link} from "@tanstack/react-router"

import {ImgFaded} from "#components/img-faded"
import type * as api from "#services/api"

function Photo(props: {photo: api.Photo}) {
  return (
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

export function PhotoGrid(props: {photos: api.Photo[]; album?: api.Album}) {
  return (
    <div className="grid grid-cols-3 gap-2 p-2 pt-0">
      {props.photos.map((photo) => (
        <Link
          key={photo.id}
          to={props.album ? `/a/$album/p/$photo` : `/p/$photo`}
          params={
            props.album
              ? {
                  album: props.album.id,
                  photo: photo.id,
                }
              : {photo: photo.id}
          }
        >
          <Photo photo={photo} />
        </Link>
      ))}
    </div>
  )
}
