import {useQueryClient} from "@tanstack/react-query"
import {createFileRoute} from "@tanstack/react-router"
import {useRef} from "react"

import {AddToAlbumDialog} from "#components/dialogs/add-to-album-dialog"
import {UploadDialog} from "#components/dialogs/upload-dialog"
import {Header} from "#components/header"
import {NewMenu} from "#components/new-menu"
import {PhotoGrid} from "#components/photo-grid"
import {UserHeaderMenu} from "#components/user-header-menu"
import {useQueryAlbum} from "#hooks/queries/photos"
import * as api from "#services/api"
import {$authState, AuthState} from "#stores/auth"

function EditableAlbumTitle(props: {album: api.Album}) {
  const timeout = useRef<ReturnType<typeof setTimeout>>(undefined)
  const queryClient = useQueryClient()
  async function _save(value: string) {
    clearTimeout(timeout.current)
    value = value.trim()
    if (value === "") return
    await api.updateAlbum({...props.album, name: value})
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
  return (
    <div className="px-2">
      {$authState.value === AuthState.AUTHENTICATED ? (
        <EditableAlbumTitle album={props.album} />
      ) : (
        <h1 className="border-b border-b-transparent text-4xl">{props.album.name}</h1>
      )}
    </div>
  )
}

function RouteComponent() {
  const {album: id} = Route.useParams()
  const album = useQueryAlbum(id)
  return (
    <>
      <Header title="Album" before={<NewMenu isAlbumType />} after={<UserHeaderMenu />} />
      {album.data && <AlbumTitle album={album.data} />}
      {album.data && <PhotoGrid photos={album.data.photos} album={album.data} />}
      {album.data && <UploadDialog album={album.data} />}
      {album.data && <AddToAlbumDialog album={album.data} />}
    </>
  )
}

export const Route = createFileRoute("/a/$album")({component: RouteComponent})
