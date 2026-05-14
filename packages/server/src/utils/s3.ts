import S3mini from "s3mini"

import type {Context} from "./hono"

export const CT_EXTENSIONS: Record<string, string[]> = {
  "image/png": [".png"],
  "image/jpeg": [".jpg", ".jpeg"],
  "image/webp": [".webp"],
  "image/avif": [".avif"],
}

export const CT_EXT: Record<string, string> = {
  "image/png": ".png",
  "image/jpeg": ".jpg",
  "image/webp": ".webp",
  "image/avif": ".avif",
}

export function makeS3(env: {
  R2_ACCESS_KEY_ID: string
  R2_SECRET_ACCESS_KEY: string
  ACCOUNT_ID: string
}) {
  return new S3mini({
    accessKeyId: env.R2_ACCESS_KEY_ID,
    secretAccessKey: env.R2_SECRET_ACCESS_KEY,
    endpoint: `https://${env.ACCOUNT_ID}.r2.cloudflarestorage.com/dcim`,
    region: "auto",
  })
}

export function getImageKey(c: Context, photo: {image_url: string}): string {
  return photo.image_url.slice(c.env.R2_URL.length).replace(/^\//, "")
}

export function getThumbnailKey(c: Context, photo: {thumbnail_url: string}): string {
  return photo.thumbnail_url.slice(c.env.R2_URL.length).replace(/^\//, "")
}
