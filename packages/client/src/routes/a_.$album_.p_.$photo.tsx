import {createFileRoute} from "@tanstack/react-router"

import {Header} from "#components/header"
import {Photo} from "#components/photo"
import {PhotoHeaderMenu} from "#components/photo-header-menu"
import {queryAlbumPhotoOptions, useQueryAlbumPhoto} from "#hooks/queries"

import {queryClient} from "../main"

function RouteComponent() {
  const params = Route.useParams()
  const photo = useQueryAlbumPhoto(params.album, params.photo)
  return (
    <div className="grid h-dvh grid-rows-[auto_1fr]">
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
