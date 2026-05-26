import {createFileRoute, Link, useNavigate} from "@tanstack/react-router"
import {Plus} from "lucide-react"

import {Header} from "#components/header.tsx"
import {ImgFaded} from "#components/img-faded.tsx"
import {IndexHeaderMenu} from "#components/menus/index-header-menu.tsx"
import {Button} from "#components/ui/button.tsx"
import {Spinner} from "#components/ui/spinner.tsx"
import {Tabs, TabsList, TabsTrigger} from "#components/ui/tabs.tsx"
import {useCreateAlbum} from "#hooks/mutations"
import {queryAlbumsOptions, useQueryAlbums, useQueryPhoto} from "#hooks/queries"
import type {Album} from "#services/api"

import {queryClient} from "../main"

function AlbumCover(props: {id: string}) {
  const photo = useQueryPhoto(props.id)
  return (
    <>
      <img
        src={photo.data.thumbhash}
        alt={photo.data.file_name}
        className="absolute inset-0 h-full w-full scale-[1.05] object-cover blur-md"
        style={{aspectRatio: `${photo.data.width / photo.data.height}`}}
      />
      <ImgFaded
        src={photo.data.thumbnail_url}
        alt={photo.data.file_name}
        className="absolute inset-0 h-full w-full object-cover"
      />
    </>
  )
}

function Album(props: {album: Album}) {
  return (
    <Link to="/a/$album" params={{album: props.album.id}}>
      <div className="flex flex-col">
        <div className="relative aspect-square overflow-hidden rounded-md bg-white dark:bg-muted">
          {props.album.newest && <AlbumCover id={props.album.newest} />}
        </div>
        <div className="mt-2 text-base font-medium">{props.album.name}</div>
        <div className="mb-1 text-xs font-medium text-muted-foreground">
          {props.album.count} item{props.album.count != 1 && "s"}
        </div>
      </div>
    </Link>
  )
}

function RouteComponent() {
  const navigate = useNavigate()
  const createAlbum = useCreateAlbum()
  const albums = useQueryAlbums()
  async function _onCreateAlbumClick() {
    const res = await createAlbum.mutateAsync("Untitled")
    await navigate({to: "/a/$album", params: {album: res.id}})
  }
  return (
    <>
      <Header>
        <Header.Before>
          <Button onClick={() => void _onCreateAlbumClick()} disabled={createAlbum.isPending}>
            {createAlbum.isPending ? <Spinner /> : <Plus />}
            New Album
          </Button>
        </Header.Before>
        <Header.Title>
          <Tabs value="albums">
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
      <div className="grid grid-cols-5 gap-4 p-4 pt-2">
        {albums.data.map((album) => (
          <Album key={album.id} album={album} />
        ))}
      </div>
    </>
  )
}

export const Route = createFileRoute("/albums")({
  component: RouteComponent,
  loader: () => queryClient.ensureQueryData(queryAlbumsOptions),
})
