import {Link} from "@tanstack/react-router"
import {ArrowLeft, ArrowRight} from "lucide-react"

import {ImgFaded} from "#components/img-faded"
import {Button} from "#components/ui/button"
import type * as api from "#services/api"

export function Photo(props: {
  photo: api.Photo & {prev: string | null; next: string | null}
  album?: api.Album
}) {
  return (
    <div className="relative grid">
      <div
        className="relative h-full place-self-center overflow-hidden"
        style={{
          aspectRatio: `${props.photo.width / props.photo.height}`,
          viewTransitionName: `photo-${props.photo.id}`,
        }}
      >
        <img
          src={props.photo.thumbhash}
          alt={props.photo.file_name}
          className="absolute inset-0 h-full w-full scale-[1.05] blur-md"
        />
        <ImgFaded
          src={props.photo.image_url}
          alt={props.photo.file_name}
          className="absolute inset-0"
        />
      </div>
      {props.photo.prev && (
        <Button
          className="absolute top-[50%] left-4 -translate-y-[50%]"
          variant="secondary"
          size="icon-lg"
          asChild
        >
          {props.album ? (
            <Link
              to="/a/$album/p/$photo"
              params={{
                album: props.album.id,
                photo: props.photo.prev,
              }}
              replace
            >
              <ArrowLeft />
            </Link>
          ) : (
            <Link to="/p/$photo" params={{photo: props.photo.prev}} replace>
              <ArrowLeft />
            </Link>
          )}
        </Button>
      )}
      {props.photo.next && (
        <Button
          className="absolute top-[50%] right-4 -translate-y-[50%]"
          variant="secondary"
          size="icon-lg"
          asChild
        >
          {props.album ? (
            <Link
              to="/a/$album/p/$photo"
              params={{
                album: props.album.id,
                photo: props.photo.next,
              }}
              replace
            >
              <ArrowRight />
            </Link>
          ) : (
            <Link to="/p/$photo" params={{photo: props.photo.next}} replace>
              <ArrowRight />
            </Link>
          )}
        </Button>
      )}
    </div>
  )
}
