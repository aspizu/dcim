import {Link} from "@tanstack/react-router"
import * as datefns from "date-fns"

import {ImgFaded} from "#components/img-faded"
import {extractTimestampFromUUIDv7} from "#lib/dates"
import type * as api from "#services/api"

function _groupPhotosByDate(photos: api.Photo[]) {
  const now = new Date()
  const currentYear = now.getFullYear()

  const startOfToday = new Date(now)
  startOfToday.setHours(0, 0, 0, 0)

  const startOfYesterday = new Date(startOfToday)
  startOfYesterday.setDate(startOfToday.getDate() - 1)

  const sevenDaysAgo = new Date(now)
  sevenDaysAgo.setDate(now.getDate() - 7)

  return Object.entries(
    Object.groupBy(photos, (photo) => {
      const date = extractTimestampFromUUIDv7(photo.id)

      let label: string

      const isToday = date >= startOfToday
      const isYesterday = date >= startOfYesterday && date < startOfToday
      const isLast7Days = date >= sevenDaysAgo && !isToday && !isYesterday
      const isCurrentYear = date.getFullYear() === currentYear

      if (isToday) {
        label = "Today"
      } else if (isYesterday) {
        label = "Yesterday"
      } else if (isLast7Days) {
        label = datefns.formatDate(date, "eeee")
      } else if (isCurrentYear) {
        label = datefns.formatDate(date, "eee, MMM d")
      } else {
        label = datefns.formatDate(date, "eee, MMM d, yyyy")
      }

      return label
    }),
  )
}

function Photo(props: {photo: api.Photo; album?: api.Album}) {
  return (
    <Link
      to={props.album ? `/a/$album/p/$photo` : `/p/$photo`}
      params={
        props.album ? {album: props.album.id, photo: props.photo.id} : {photo: props.photo.id}
      }
    >
      <div
        className="relative aspect-square overflow-hidden rounded-md"
        style={{
          viewTransitionName: `photo-${props.photo.id}`,
        }}
      >
        <img
          src={props.photo.thumbhash}
          alt={props.photo.file_name}
          className="absolute inset-0 h-full w-full scale-[1.05] object-cover blur-md"
          style={{aspectRatio: `${props.photo.width / props.photo.height}`}}
        />
        <ImgFaded
          src={props.photo.thumbnail_url}
          alt={props.photo.file_name}
          className="absolute inset-0 h-full w-full object-cover"
        />
      </div>
    </Link>
  )
}

export function PhotoGrid(props: {photos: api.Photo[]; album?: api.Album}) {
  const groups = _groupPhotosByDate(props.photos)
  return (
    <div className="flex flex-col">
      {groups.map(([key, photos]) => (
        <div key={key} className="group flex flex-col">
          <h2 className="mb-2 text-sm font-medium not-group-first:mt-4">{key}</h2>
          <div className="grid grid-cols-3 gap-2">
            {photos?.map((photo) => (
              <Photo key={photo.id} photo={photo} album={props.album} />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
