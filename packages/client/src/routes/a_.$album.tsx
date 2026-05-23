import {useQueryClient} from "@tanstack/react-query"
import {createFileRoute} from "@tanstack/react-router"
import {isSameDay, format} from "date-fns"
import {useRef} from "react"

import {Header} from "#components/header"
import {NewMenu} from "#components/menus/new-menu"
import {UserHeaderMenu} from "#components/menus/user-header-menu"
import {PhotoGrid} from "#components/photo-grid"
import {
  queryAlbumOptions,
  queryAlbumPhotosOptions,
  useQueryAlbum,
  useQueryAlbumPhotos,
} from "#hooks/queries"
import {useOnScrollEnd} from "#hooks/use-on-scroll-end"
import {extractTimestampFromUUIDv7} from "#lib/utils"
import * as api from "#services/api"
import {$authState, AuthState} from "#stores/auth"

import {queryClient} from "../main"

function EditableAlbumTitle(props: {album: api.Album}) {
  const timeout = useRef<ReturnType<typeof setTimeout>>(undefined)
  const queryClient = useQueryClient()
  async function _save(value: string) {
    clearTimeout(timeout.current)
    value = value.trim()
    if (value === "") return
    await api.updateAlbum({id: props.album.id, name: value})
    queryClient.setQueryData(["album", props.album.id], (oldAlbum: api.Album) => ({
      ...oldAlbum,
      name: value,
    }))
  }
  return (
    <input
      defaultValue={props.album.name}
      className="w-full border-b border-b-transparent text-4xl transition-colors outline-none focus:border-b-primary"
      onBlur={(event) => {
        if (event.target.value.trim() === "") {
          event.target.value = event.target.defaultValue
        }
      }}
      onChange={(event) => {
        setTimeout(() => void _save(event.target.value), 500)
      }}
      onKeyUp={(event: any) => {
        if (event.key === "Enter") {
          void _save(event.target.value)
        }
      }}
    />
  )
}

function AlbumTitle(props: {album: api.Album}) {
  const newestTime = props.album.newest ? extractTimestampFromUUIDv7(props.album.newest) : null
  const oldestTime = props.album.oldest ? extractTimestampFromUUIDv7(props.album.oldest) : null

  const dateLabel = (() => {
    if (!newestTime || !oldestTime) {
      return null
    }
    if (isSameDay(oldestTime, newestTime)) {
      return format(newestTime, "EEEE, MMMM d, yyyy")
    }
    return `${format(oldestTime, "MMM d, yyyy")} – ${format(newestTime, "MMM d, yyyy")}`
  })()

  return (
    <div className="flex flex-col px-2 pt-8 pb-4">
      {$authState.value === AuthState.AUTHENTICATED ? (
        <EditableAlbumTitle album={props.album} />
      ) : (
        <h1 className="border-b border-b-transparent text-4xl">{props.album.name}</h1>
      )}
      <span className="mt-1 text-sm text-muted-foreground">{dateLabel}</span>
    </div>
  )
}

function RouteComponent() {
  const {album: id} = Route.useParams()
  const album = useQueryAlbum(id)
  const albumPhotos = useQueryAlbumPhotos(id)
  useOnScrollEnd(albumPhotos.fetchNextPage)
  const allPhotos = albumPhotos.data.pages.reduce(
    (prev: api.Photo[], cur) => [...prev, ...cur.photos],
    [],
  )
  return (
    <>
      <Header
        title="Album"
        before={$authState.value === AuthState.AUTHENTICATED && <NewMenu album={album.data} />}
        after={<UserHeaderMenu />}
      />
      <AlbumTitle album={album.data} />
      <div className="p-2 pt-0">
        <PhotoGrid photos={allPhotos} album={album.data} />
      </div>
    </>
  )
}

export const Route = createFileRoute("/a_/$album")({
  component: RouteComponent,
  loader: ({params}) =>
    Promise.all([
      queryClient.ensureQueryData(queryAlbumOptions(params.album)),
      queryClient.ensureInfiniteQueryData(queryAlbumPhotosOptions(params.album)),
    ]),
})
