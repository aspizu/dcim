import {Link} from "@tanstack/react-router"

import {ImgFaded} from "#components/img-faded"
import {useQueryAlbums} from "#hooks/queries"

function AlbumCover(props: {
  album: {cover: {thumbhash: string; thumbnail_url: string} | null}
}) {
  if (!props.album.cover) {
    return <div className="aspect-square w-full shrink-0 rounded bg-muted" />
  }
  return (
    <div className="relative aspect-square w-full overflow-hidden rounded">
      <img
        src={props.album.cover.thumbhash}
        alt=""
        className="absolute inset-0 size-full scale-[1.05] object-cover blur-md"
      />
      <ImgFaded
        src={props.album.cover.thumbnail_url}
        alt=""
        className="absolute inset-0 size-full object-cover"
      />
    </div>
  )
}

export default function Sidebar() {
  const albums = useQueryAlbums()

  return (
    <div className="flex flex-col gap-2">
      <h1 className="mt-4 px-1 text-xs font-semibold tracking-wider text-muted-foreground uppercase">
        Albums
      </h1>

      {albums.data?.map((album) => (
        <Link
          key={album.id}
          to="/a/$album"
          params={{album: album.id}}
          className="rounded-md ring-ring outline-none focus-visible:ring-2"
        >
          <div className="flex flex-col gap-2 rounded-md bg-card p-1 transition-colors hover:bg-accent">
            <AlbumCover album={album} />
            <div className="flex min-w-0 flex-col px-1 pb-1">
              <span className="truncate text-sm font-medium">{album.name}</span>
              <span className="text-xs text-muted-foreground">
                {album.count} {album.count === 1 ? "item" : "items"}
              </span>
            </div>
          </div>
        </Link>
      ))}
    </div>
  )
}
