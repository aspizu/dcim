import {createFileRoute} from "@tanstack/react-router"

import {Header} from "#components/header"
import {PhotoHeaderMenu} from "#components/menus"
import {Photo} from "#components/photo"
import {queryPhotoOptions, useQueryPhoto} from "#hooks/queries"

import {queryClient} from "../main"

function RouteComponent() {
  const {photo: id} = Route.useParams()
  const photo = useQueryPhoto(id)
  return (
    <div className="flex h-dvh w-dvw flex-col overflow-hidden">
      <Header>
        <Header.Before />
        <Header.Title>{photo.data.file_name}</Header.Title>
        <Header.After>
          <PhotoHeaderMenu photo={photo.data} />
        </Header.After>
      </Header>
      <Photo photo={photo.data} />
    </div>
  )
}

export const Route = createFileRoute("/p/$photo")({
  loader: ({params: {photo}}) => queryClient.ensureQueryData(queryPhotoOptions(photo)),
  component: RouteComponent,
})
