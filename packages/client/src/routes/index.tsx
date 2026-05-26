import {createFileRoute, Link} from "@tanstack/react-router"

import {Header} from "#components/header"
import {IndexHeaderMenu, NewMenu} from "#components/menus"
import {PhotoGrid} from "#components/photo-grid"
import {Tabs, TabsList, TabsTrigger} from "#components/ui/tabs.tsx"
import {queryPhotosOptions, useQueryPhotos} from "#hooks/queries"
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
      <Header>
        <Header.Before>
          <NewMenu />
        </Header.Before>
        <Header.Title>
          <Tabs value="photos">
            <TabsList>
              <TabsTrigger value="photos" asChild>
                <Link to="/">Photos</Link>
              </TabsTrigger>
              <TabsTrigger value="albums">
                <Link to="/albums">Albums</Link>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </Header.Title>
        <Header.After>
          <IndexHeaderMenu />
        </Header.After>
      </Header>
      <div className="p-2">
        <PhotoGrid photos={allPhotos} />
      </div>
    </>
  )
}

export const Route = createFileRoute("/")({
  component: RouteComponent,
  loader: () => queryClient.ensureInfiniteQueryData(queryPhotosOptions),
})
