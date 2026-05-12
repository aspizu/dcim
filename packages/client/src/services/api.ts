export type * from "./fetch"
import {call} from "./fetch"

export type ContentType = "image/png" | "image/jpeg" | "image/webp" | "image/avif"

export interface Photo {
  id: string
  image_url: string
  thumbnail_url: string
  thumbhash: string
  content_sha256: string
  timestamp: string
  content_type: ContentType
  content_length: number
  file_name: string
  metadata?: Record<string, unknown> | null
  status: string
  width: number
  height: number
}

export interface Album {
  id: string
  name: string
  description?: string | null
  metadata?: Record<string, unknown> | null
  created_at: string
}

export type AlbumWithPhotos = Album & {photos: Photo[]}

export async function listAlbums(): Promise<Album[]> {
  return call("GET", "/album")
}

export async function getAlbum({id}: {id: string}): Promise<AlbumWithPhotos> {
  return call("GET", `/album/${id}`)
}

export async function createAlbum(body: {
  name: string
  description?: string | null
  metadata?: Record<string, unknown> | null
}): Promise<{id: string}> {
  return call("POST", "/album", body)
}

export async function updateAlbum({
  id,
  ...body
}: {
  id: string
  name: string
  description?: string | null
  metadata?: Record<string, unknown> | null
}): Promise<void> {
  return call("PUT", `/album/${id}`, body)
}

export async function addPhotoToAlbum(opts: {id: string; photoID: string}): Promise<void> {
  return call("POST", `/album/${opts.id}`, {photoID: opts.photoID})
}

export async function listPhotos(): Promise<Photo[]> {
  return call("GET", "/photo")
}

export async function getPhoto(opts: {id: string}): Promise<Photo> {
  return call("GET", `/photo/${opts.id}`)
}

export async function createPhoto(body: {
  contentSHA256: string
  thumbnailContentSHA256: string
  thumbnailContentLength: number
  thumbnailContentType: ContentType
  thumbhash: string
  timestamp: string
  contentType: ContentType
  contentLength: number
  fileName: string
  metadata?: Record<string, unknown> | null
  width: number
  height: number
}): Promise<{id: string; imagePresignedURL: string; thumbnailPresignedURL: string}> {
  return call("POST", "/photo", body)
}

export async function confirmPhotoUploaded(opts: {id: string}): Promise<void> {
  return call("PATCH", `/photo/${opts.id}`, {})
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
