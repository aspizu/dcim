import {createFileRoute} from "@tanstack/react-router"

import {UploadDialog} from "#components/dialogs/upload-dialog"
import {Header} from "#components/header"
import {NewMenu} from "#components/new-menu"
import {PhotoGrid} from "#components/photo-grid"
import Sidebar from "#components/sidebar"
import {UserHeaderMenu} from "#components/user-header-menu"
import {queryAlbumsOptions, queryPhotosOptions, useQueryPhotos} from "#hooks/queries"
import type {Photo} from "#services/api"

import {queryClient} from "../main"

function RouteComponent() {
  const photos = useQueryPhotos()
  return (
    <>
      <Header title="Photos" before={<NewMenu />} after={<UserHeaderMenu />} />
      <div className="grid grid-cols-[200px_auto] gap-2 px-2 pb-2">
        <Sidebar />
        <PhotoGrid
          photos={photos.data.pages.reduce(
            (prev: Photo[], cur) => [...prev, ...cur.photos],
            [],
          )}
        />
      </div>
      <UploadDialog />
    </>
  )
}

export const Route = createFileRoute("/")({
  component: RouteComponent,
  loader: () =>
    Promise.all([
      queryClient.ensureQueryData(queryAlbumsOptions),
      queryClient.ensureInfiniteQueryData(queryPhotosOptions),
    ]),
})
