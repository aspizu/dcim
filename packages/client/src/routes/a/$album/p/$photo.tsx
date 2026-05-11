import {Header} from "#components/header"
import {PhotoHeaderMenu} from "#components/header-menus/photo-header-menu"
import {Photo} from "#components/photo"
import {useQueryAlbum, useQueryPhoto} from "#hooks/queries/photos"
import {$authState, AuthState} from "#stores/auth"
import {createFileRoute} from "@tanstack/react-router"

function PageUnauthenticated(props: {albumID: string; photoID: string}) {
  const photo = useQueryPhoto(props.photoID)
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

function PageAuthenticated(props: {albumID: string; photoID: string}) {
  const album = useQueryAlbum(props.albumID)
  const photoIdx = album.data
    ? album.data.photos.findIndex((photo) => photo.id === props.photoID)
    : -1
  const previousPhoto = photoIdx > 0 ? album.data?.photos[photoIdx - 1] : undefined
  const photo = album.data?.photos[photoIdx]
  const nextPhoto =
    photoIdx < (album.data?.photos.length ?? 0) - 1
      ? album.data?.photos[photoIdx + 1]
      : undefined
  return (
    <div className="grid h-dvh grid-rows-[auto_1fr]">
      <Header
        title={photo?.file_name ?? "Photo"}
        after={photo && <PhotoHeaderMenu photo={photo} album={album.data} />}
      />
      {album.data && photo && (
        <Photo
          photo={photo}
          previousPhoto={previousPhoto}
          nextPhoto={nextPhoto}
          album={album.data}
        />
      )}
    </div>
  )
}

function RouteComponent() {
  const {album: albumID, photo: photoID} = Route.useParams()
  if ($authState.value === AuthState.AUTHENTICATED) {
    return <PageAuthenticated albumID={albumID} photoID={photoID} />
  }
  if ($authState.value === AuthState.UNAUTHENTICATED) {
    return <PageUnauthenticated albumID={albumID} photoID={photoID} />
  }
  return null
}

export const Route = createFileRoute("/a/$album/p/$photo")({component: RouteComponent})
