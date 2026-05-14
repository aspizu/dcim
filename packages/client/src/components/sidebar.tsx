import {Link} from "@tanstack/react-router"
import * as datefns from "date-fns"

import {useQueryAlbums} from "#hooks/queries"

export default function Sidebar() {
  const albums = useQueryAlbums()
  return (
    <div className="flex flex-col gap-2">
      <h1 className="mt-4 text-sm font-medium">Albums</h1>
      {albums.data?.map((album) => (
        <Link key={album.id} to="/a/$album" params={{album: album.id}}>
          <div className="flex flex-col rounded-md bg-card px-2 py-1">
            <span className="w-full truncate">{album.name}</span>
            <span className="text-xs text-muted-foreground">
              {datefns.formatDistanceToNow(album.updated_at)} ago
            </span>
          </div>
        </Link>
      ))}
    </div>
  )
}
