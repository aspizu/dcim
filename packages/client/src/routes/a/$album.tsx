import {Header} from "#components/header"
import {UserHeaderMenu} from "#components/header-menus/user-header-menu"
import {PhotoGrid} from "#components/photo-grid"
import {UploadButton} from "#components/upload-button"
import {useQueryAlbum} from "#hooks/queries/photos"
import {createFileRoute} from "@tanstack/react-router"

function RouteComponent() {
  const {album: id} = Route.useParams()
  const album = useQueryAlbum(id)
  return (
    <>
      <Header title="Photos" before={<UploadButton />} after={<UserHeaderMenu />} />
      {album.data && <PhotoGrid photos={album.data.photos} album={album.data} />}
    </>
  )
}

export const Route = createFileRoute("/a/$album")({component: RouteComponent})
