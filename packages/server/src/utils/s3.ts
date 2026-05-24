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
  S3_ACCESS_KEY_ID: string
  S3_SECRET_ACCESS_KEY: string
  S3_ENDPOINT: string
  S3_REGION: string
}) {
  return new S3mini({
    accessKeyId: env.S3_ACCESS_KEY_ID,
    secretAccessKey: env.S3_SECRET_ACCESS_KEY,
    endpoint: env.S3_ENDPOINT,
    region: env.S3_REGION,
  })
}

export function getImageKey(c: Context, photo: {image_url: string}): string {
  return photo.image_url.slice(c.env.S3_PUBLIC_URL.length).replace(/^\//, "")
}

export function getThumbnailKey(c: Context, photo: {thumbnail_url: string}): string {
  return photo.thumbnail_url.slice(c.env.S3_PUBLIC_URL.length).replace(/^\//, "")
}
