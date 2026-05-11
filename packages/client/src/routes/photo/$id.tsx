import {Header} from "#components/header"
import {PhotoHeaderMenu} from "#components/header-menus/image-header-menu"
import {ImgFaded} from "#components/img-faded"
import {Button} from "#components/ui/button"
import {useQueryPhoto, useQueryPhotos} from "#hooks/queries/photos"
import type * as api from "#services/api"
import {$authState, AuthState} from "#stores/auth"
import {createFileRoute, Link} from "@tanstack/react-router"
import {ArrowLeft, ArrowRight} from "lucide-react"

function Photo(props: {photo: api.Photo; previousPhoto?: api.Photo; nextPhoto?: api.Photo}) {
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
      {props.previousPhoto && (
        <Button
          className="absolute top-[50%] left-4 -translate-y-[50%]"
          variant="secondary"
          size="icon-lg"
          asChild
        >
          <Link to="/photo/$id" params={{id: props.previousPhoto.id}} replace>
            <ArrowLeft />
          </Link>
        </Button>
      )}
      {props.nextPhoto && (
        <Button
          className="absolute top-[50%] right-4 -translate-y-[50%]"
          variant="secondary"
          size="icon-lg"
          asChild
        >
          <Link to="/photo/$id" params={{id: props.nextPhoto.id}} replace>
            <ArrowRight />
          </Link>
        </Button>
      )}
    </div>
  )
}

function PageUnauthenticated(props: {id: string}) {
  const photo = useQueryPhoto(props.id)
  return (
    <div className="grid h-dvh grid-rows-[auto_1fr]">
      <Header
        title={photo.data?.file_name ?? "Photo"}
        after={photo.data && <PhotoHeaderMenu photo={photo.data} />}
      />
      {photo.data && <Photo photo={photo.data} />}
    </div>
  )
}

function PageAuthenticated(props: {id: string}) {
  const photos = useQueryPhotos()
  const photoIdx = photos.data ? photos.data.findIndex((photo) => photo.id === props.id) : -1
  const previousPhoto = photoIdx > 0 ? photos.data?.[photoIdx - 1] : undefined
  const photo = photos.data?.[photoIdx]
  const nextPhoto =
    photoIdx < (photos.data?.length ?? 0) - 1 ? photos.data?.[photoIdx + 1] : undefined
  return (
    <div className="grid h-dvh grid-rows-[auto_1fr]">
      <Header
        title={photo?.file_name ?? "Photo"}
        after={photo && <PhotoHeaderMenu photo={photo} />}
      />
      {photo && <Photo photo={photo} previousPhoto={previousPhoto} nextPhoto={nextPhoto} />}
    </div>
  )
}

function RouteComponent() {
  const {id} = Route.useParams()
  if ($authState.value === AuthState.AUTHENTICATED) {
    return <PageAuthenticated id={id} />
  }
  if ($authState.value === AuthState.UNAUTHENTICATED) {
    return <PageUnauthenticated id={id} />
  }
  return null
}

export const Route = createFileRoute("/photo/$id")({component: RouteComponent})
