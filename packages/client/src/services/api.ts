export type * from "./fetch"
import {call} from "./fetch"

export type ContentType = "image/png" | "image/jpeg" | "image/webp" | "image/avif"

export interface Photo {
  id: string
  image_url: string
  thumbnail_url: string
  thumbhash: string
  content_length: number
  file_name: string
  status: string
  metadata: Record<string, unknown>
  width: number
  height: number
  uploaded_at: string
}

export interface Album {
  id: string
  name: string
  count: number
  oldest: string | null
  newest: string | null
  updated_at: string
}

export type AlbumWithPhotos = Album & {next: string | null; photos: Photo[]}

export async function listAlbums(): Promise<Array<Album & {cover: Photo | null}>> {
  return call("GET", "/album")
}

export async function getAlbum({
  id,
  next,
}: {
  id: string
  next?: string
}): Promise<AlbumWithPhotos> {
  return call("GET", next ? `/album?next=${id}` : `/album/${id}`)
}

export async function createAlbum(body: {name: string}): Promise<{id: string}> {
  return call("POST", "/album", body)
}

export async function updateAlbum({id, ...body}: {id: string; name: string}): Promise<void> {
  return call("PUT", `/album/${id}`, body)
}

export async function addPhotoToAlbum(opts: {id: string; photoID: string}): Promise<void> {
  return call("POST", `/album/${opts.id}`, {photoID: opts.photoID})
}

export async function listPhotos(opts: {
  next?: string
}): Promise<{next: string | null; photos: Photo[]}> {
  return call("GET", opts.next ? `/photo?next=${opts.next}` : "/photo")
}

export async function getPhoto(opts: {
  id: string
}): Promise<Photo & {next: string | null; prev: string | null}> {
  return call("GET", `/photo/${opts.id}`)
}

export async function createPhoto(body: {
  fileName: string
  image: {contentType: ContentType; contentSHA256: string; contentLength: number}
  thumbnail: {contentType: ContentType; contentSHA256: string; contentLength: number}
  thumbhash: string
  width: number
  height: number
  metadata: Record<string, unknown>
}): Promise<{id: string; imagePresignedURL: string; thumbnailPresignedURL: string}> {
  return call("POST", "/photo", body)
}

export async function confirmPhotoUploaded(opts: {id: string}): Promise<void> {
  return call("PATCH", `/photo/${opts.id}/mark-as-uploaded`)
}

export async function removePhotoFromAlbum(opts: {id: string; photoID: string}): Promise<void> {
  return call("DELETE", `/album/${opts.id}/${opts.photoID}`)
}

export async function deletePhoto({id}: {id: string}): Promise<void> {
  return call("DELETE", `/photo/${id}`)
}

export async function login({totp}: {totp: string}): Promise<void> {
  return call("POST", "/auth/login", {totp})
}

export async function logout(): Promise<void> {
  return call("POST", "/auth/logout")
}

export async function whoami(): Promise<void> {
  return call("GET", "/auth/whoami")
}
