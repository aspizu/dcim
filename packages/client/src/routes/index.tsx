import {createFileRoute} from "@tanstack/react-router"

import {Header} from "#components/header"
import {IndexHeaderMenu, NewMenu} from "#components/menus"
import {PhotoGrid} from "#components/photo-grid"
import Sidebar from "#components/sidebar"
import {queryAlbumsOptions, queryPhotosOptions, useQueryPhotos} from "#hooks/queries"
import {useOnScrollEnd} from "#hooks/use-on-scroll-end"
import type {Photo} from "#services/api"

import {queryClient} from "../main"

function RouteComponent() {
  const photos = useQueryPhotos()
  useOnScrollEnd(photos.fetchNextPage)
  const allPhotos = photos.data.pages.reduce(
    (prev: Photo[], cur) => [...prev, ...cur.photos],
    [],
  )
  return (
    <>
      <Header title="Photos" before={<NewMenu />} after={<IndexHeaderMenu />} />
      <div className="grid grid-cols-[200px_auto] gap-2 px-2 pb-2">
        <Sidebar />
        <PhotoGrid photos={allPhotos} />
      </div>
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
