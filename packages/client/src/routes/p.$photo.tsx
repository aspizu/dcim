import {createFileRoute} from "@tanstack/react-router"
import {useState} from "react"

import {Header} from "#components/header"
import {PhotoHeaderMenu} from "#components/menus"
import {Photo} from "#components/photo"
import {queryPhotoOptions, useQueryPhoto} from "#hooks/queries"

import {queryClient} from "../main"

function RouteComponent() {
  const {photo: id} = Route.useParams()
  const photo = useQueryPhoto(id)
  const [captionEditable, setCaptionEditable] = useState(false)
  return (
    <div className="flex h-dvh w-dvw flex-col overflow-hidden">
      <Header>
        <Header.Before />
        <Header.Title>{photo.data.file_name}</Header.Title>
        <Header.After>
          <PhotoHeaderMenu photo={photo.data} setCaptionEditable={setCaptionEditable} />
        </Header.After>
      </Header>
      <Photo
        photo={photo.data}
        captionEditable={captionEditable}
        setCaptionEditable={setCaptionEditable}
      />
    </div>
  )
}

export const Route = createFileRoute("/p/$photo")({
  loader: ({params: {photo}}) => queryClient.ensureQueryData(queryPhotoOptions(photo)),
  component: RouteComponent,
})
