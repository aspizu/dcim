import * as datefns from "date-fns"

import type * as api from "#services/api"

export function extractTimestampFromUUIDv7(uuid: string) {
  const hex = uuid.replace(/-/g, "")
  if (hex.length < 12) {
    throw new Error("Invalid UUID")
  }
  const timestampHex = hex.slice(0, 12)
  const timestampMs = parseInt(timestampHex, 16)
  return new Date(timestampMs)
}

export function formatDateRange(start: Date, end: Date) {
  const sameDay = datefns.differenceInCalendarDays(end, start) < 1

  if (sameDay) {
    return datefns.format(start, "MMM d, yyyy")
  }

  const sameYear = start.getFullYear() === end.getFullYear()
  const sameMonth = sameYear && start.getMonth() === end.getMonth()

  if (sameMonth) {
    return `${datefns.format(start, "MMM d")}-${datefns.format(end, "d, yyyy")}`
  }

  if (sameYear) {
    return `${datefns.format(start, "MMM d")}-${datefns.format(end, "MMM d, yyyy")}`
  }

  return `${datefns.format(start, "MMM d, yyyy")}-${datefns.format(end, "MMM d, yyyy")}`
}

export function groupPhotosByDate(photos: api.Photo[]) {
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
