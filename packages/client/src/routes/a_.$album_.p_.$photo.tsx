import {createFileRoute} from "@tanstack/react-router"

import {Header} from "#components/header"
import {PhotoHeaderMenu} from "#components/menus/photo-header-menu"
import {Photo} from "#components/photo"
import {queryAlbumPhotoOptions, useQueryAlbumPhoto} from "#hooks/queries"

import {queryClient} from "../main"

function RouteComponent() {
  const params = Route.useParams()
  const photo = useQueryAlbumPhoto(params.album, params.photo)
  return (
    <div className="flex h-dvh w-dvw flex-col">
      <Header title={photo.data.file_name} after={<PhotoHeaderMenu photo={photo.data} />} />
      <Photo photo={photo.data} />
    </div>
  )
}

export const Route = createFileRoute("/a_/$album_/p_/$photo")({
  component: RouteComponent,
  loader: ({params}) =>
    queryClient.ensureQueryData(queryAlbumPhotoOptions(params.album, params.photo)),
})
