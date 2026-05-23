import {clsx, type ClassValue} from "clsx"
import {twMerge} from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function extractTimestampFromUUIDv7(uuid: string) {
  const hex = uuid.replace(/-/g, "")

  if (hex.length < 12) {
    throw new Error("Invalid UUID")
  }

  const timestampHex = hex.slice(0, 12)
  const timestampMs = parseInt(timestampHex, 16)

  return new Date(timestampMs)
}
