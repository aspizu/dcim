import {Link} from "@tanstack/react-router"
import {useWindowSize} from "@uidotdev/usehooks"
import {ArrowLeft, ArrowRight} from "lucide-react"

import {ImgFaded} from "#components/img-faded"
import {Button} from "#components/ui/button"
import type * as api from "#services/api"

export function Photo(props: {
  photo: api.Photo & {prev: string | null; next: string | null}
  album?: api.Album
}) {
  let w: number | null = null
  let h: number | null = null

  const photoW = props.photo.width
  const photoH = props.photo.height
  const aspect = photoW / photoH

  const windowSize = useWindowSize()

  if (windowSize.width && windowSize.height) {
    const maxW = windowSize.width
    const maxH = windowSize.height - 88

    if (maxW / maxH > aspect) {
      h = maxH
      w = maxH * aspect
    } else {
      w = maxW
      h = maxW / aspect
    }
  }
  return (
    <div className="relative mb-11 grid grow place-items-center">
      <div
        className="relative overflow-hidden"
        style={{
          aspectRatio: `${props.photo.width / props.photo.height}`,
          viewTransitionName: `photo-${props.photo.id}`,
          width: `${w}px`,
          height: `${h}px`,
        }}
      >
        <img
          src={props.photo.thumbhash}
          alt={props.photo.file_name}
          className="absolute inset-0 scale-[1.05] blur-md"
        />
        <ImgFaded
          src={props.photo.thumbnail_url}
          alt={props.photo.file_name}
          className="absolute inset-0 h-full w-full"
        />
        <ImgFaded
          src={props.photo.image_url}
          alt={props.photo.file_name}
          className="absolute inset-0 h-full w-full"
        />
      </div>
      {props.photo.prev && (
        <Button
          className="absolute top-[50%] left-4 translate-y-[-50%]"
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
          className="absolute top-[50%] right-4 translate-y-[-50%]"
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
