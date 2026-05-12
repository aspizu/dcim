import {createFileRoute} from "@tanstack/react-router"

import {UploadDialog} from "#components/dialogs/upload-dialog"
import {Header} from "#components/header"
import {NewMenu} from "#components/new-menu"
import {PhotoGrid} from "#components/photo-grid"
import {UserHeaderMenu} from "#components/user-header-menu"
import {useQueryPhotos} from "#hooks/queries/photos"

function RouteComponent() {
  const photos = useQueryPhotos()
  return (
    <>
      <Header title="Photos" before={<NewMenu />} after={<UserHeaderMenu />} />
      {photos.data && <PhotoGrid photos={photos.data} />}
      <UploadDialog />
    </>
  )
}

export const Route = createFileRoute("/")({component: RouteComponent})
