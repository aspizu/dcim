import {useQuery} from "@tanstack/react-query"
import type {ComponentProps} from "react"

import {Photo} from "#components/photo"
import {queryAlbumPhotoOptions, queryPhotoOptions} from "#hooks/queries"

type PhotoProps = ComponentProps<typeof Photo>

function AdjacentPhoto(props: {id: string; viewer: PhotoProps}) {
  const photo = useQuery(
    props.viewer.album
      ? queryAlbumPhotoOptions(props.viewer.album.id, props.id)
      : queryPhotoOptions(props.id),
  )
  if (!photo.data) {
    return null
  }
  return <Photo {...props.viewer} photo={photo.data} captionEditable={false} preview />
}

export function PhotoStrip(props: PhotoProps) {
  return (
    <div className="relative min-h-0 grow overflow-hidden">
      {props.photo.prev && (
        <div className="absolute inset-0 flex -translate-x-full" inert aria-hidden="true">
          <AdjacentPhoto key={props.photo.prev} id={props.photo.prev} viewer={props} />
        </div>
      )}
      <div className="absolute inset-0 flex">
        <Photo key={props.photo.id} {...props} />
      </div>
      {props.photo.next && (
        <div className="absolute inset-0 flex translate-x-full" inert aria-hidden="true">
          <AdjacentPhoto key={props.photo.next} id={props.photo.next} viewer={props} />
        </div>
      )}
    </div>
  )
}
