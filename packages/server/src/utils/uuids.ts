import {isValid, parse} from "date-fns"
import {v7 as uuidv7} from "uuid"

export function generatePhotoID(metadata: {
  DateTimeOriginal?: string
  CreateDate?: string
  DateTimeDigitized?: string
}) {
  const exifDate =
    metadata.DateTimeOriginal ?? metadata.CreateDate ?? metadata.DateTimeDigitized
  const parsed = exifDate ? parse(exifDate, "yyyy:MM:dd HH:mm:ss", new Date()) : new Date()
  return uuidv7({
    msecs: isValid(parsed) ? parsed.getTime() : Date.now(),
  })
}
