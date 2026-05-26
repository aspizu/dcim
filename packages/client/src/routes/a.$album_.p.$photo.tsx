import {createFileRoute} from "@tanstack/react-router"

import {Header} from "#components/header"
import {PhotoHeaderMenu} from "#components/menus"
import {Photo} from "#components/photo"
import {
  queryAlbumOptions,
  queryAlbumPhotoOptions,
  useQueryAlbum,
  useQueryAlbumPhoto,
} from "#hooks/queries"

import {queryClient} from "../main"

function RouteComponent() {
  const params = Route.useParams()
  const album = useQueryAlbum(params.album)
  const photo = useQueryAlbumPhoto(params.album, params.photo)
  return (
    <div className="flex h-dvh w-dvw flex-col">
      <Header>
        <Header.Before />
        <Header.Title>{photo.data.file_name}</Header.Title>
        <Header.After>
          <PhotoHeaderMenu album={album.data} photo={photo.data} />
        </Header.After>
      </Header>
      <Photo photo={photo.data} album={album.data} />
    </div>
  )
}

export const Route = createFileRoute("/a/$album_/p/$photo")({
  component: RouteComponent,
  loader: ({params}) =>
    Promise.all([
      queryClient.ensureQueryData(queryAlbumOptions(params.album)),
      queryClient.ensureQueryData(queryAlbumPhotoOptions(params.album, params.photo)),
    ]),
})
