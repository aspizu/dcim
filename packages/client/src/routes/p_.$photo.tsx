import {createFileRoute} from "@tanstack/react-router"

import {Header} from "#components/header"
import {Photo} from "#components/photo"
import {PhotoHeaderMenu} from "#components/photo-header-menu"
import {useQueryPhoto, useQueryPhotos} from "#hooks/queries"
import {$authState, AuthState} from "#stores/auth"

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
  const photosData = photos.data?.photos ?? []
  const photoIdx = photosData.findIndex((photo) => photo.id === props.id)
  const previousPhoto = photoIdx > 0 ? photosData[photoIdx - 1] : undefined
  const photo = photosData[photoIdx]
  const nextPhoto = photoIdx < photosData.length - 1 ? photosData[photoIdx + 1] : undefined
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
  const {photo: id} = Route.useParams()
  if ($authState.value === AuthState.AUTHENTICATED) {
    return <PageAuthenticated id={id} />
  }
  if ($authState.value === AuthState.UNAUTHENTICATED) {
    return <PageUnauthenticated id={id} />
  }
  return null
}

export const Route = createFileRoute("/p_/$photo")({component: RouteComponent})
