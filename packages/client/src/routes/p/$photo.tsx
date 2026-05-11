import {Header} from "#components/header"
import {PhotoHeaderMenu} from "#components/header-menus/photo-header-menu"
import {Photo} from "#components/photo"
import {useQueryPhoto, useQueryPhotos} from "#hooks/queries/photos"
import {$authState, AuthState} from "#stores/auth"
import {createFileRoute} from "@tanstack/react-router"

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
  const {photo} = Route.useParams()
  const id = photo.split("--")[0]
  if ($authState.value === AuthState.AUTHENTICATED) {
    return <PageAuthenticated id={id} />
  }
  if ($authState.value === AuthState.UNAUTHENTICATED) {
    return <PageUnauthenticated id={id} />
  }
  return null
}

export const Route = createFileRoute("/p/$photo")({component: RouteComponent})
