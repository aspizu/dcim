import {createFileRoute} from "@tanstack/react-router"

import {Header} from "#components/header"
import {Photo} from "#components/photo"
import {PhotoHeaderMenu} from "#components/photo-header-menu"
import {queryPhotoOptions, useQueryPhoto} from "#hooks/queries"

import {queryClient} from "../main"

function RouteComponent() {
  const {photo: id} = Route.useParams()
  const photo = useQueryPhoto(id)
  return (
    <div className="grid h-dvh grid-rows-[auto_1fr]">
      <Header title={photo.data.file_name} after={<PhotoHeaderMenu photo={photo.data} />} />
      <Photo photo={photo.data} />
    </div>
  )
}

export const Route = createFileRoute("/p_/$photo")({
  loader: ({params: {photo}}) => queryClient.ensureQueryData(queryPhotoOptions(photo)),
  component: RouteComponent,
})
