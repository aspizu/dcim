import {differenceInCalendarDays, format} from "date-fns"

export function extractTimestampFromUUIDv7(uuid: string) {
  const hex = uuid.replace(/-/g, "")
  if (hex.length < 12) {
    throw new Error("Invalid UUID")
  }
  const timestampHex = hex.slice(0, 12)
  const timestampMs = parseInt(timestampHex, 16)
  return new Date(timestampMs)
}
export function formatDateRange(oldest: Date, newest: Date) {
  if (differenceInCalendarDays(newest, oldest) < 1) {
    return format(oldest, "MMM d")
  }
  const currentYear = new Date().getFullYear()
  if (oldest.getFullYear() === currentYear && newest.getFullYear() === currentYear) {
    return `${format(oldest, "MMM d")}-${format(newest, "d")}`
  }
  return `${format(oldest, "MMM d")}-${format(newest, "d, yyyy")}`
}
