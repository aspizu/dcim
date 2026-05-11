export {ApiError, NetworkError} from "./fetch"
import {call as _call} from "./fetch"

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
  metadata: Record<string, unknown> | null
  status: string
  width: number
  height: number
}

export interface Album {
  id: string
  name: string
  description?: string
  metadata: Record<string, unknown> | null
  created_at: string
}

export type AlbumWithPhotos = Album & {photos: Photo[]}

export async function listAlbums(): Promise<Album[]> {
  return _call("GET", "/album")
}

export async function getAlbum({id}: {id: string}): Promise<AlbumWithPhotos> {
  return _call("GET", `/album/${id}`)
}

export async function createAlbum(body: {
  name: string
  description?: string
  metadata?: Record<string, unknown>
}): Promise<{id: string}> {
  return _call("POST", "/album", body)
}

export async function updateAlbum({
  id,
  ...body
}: {
  id: string
  name: string
  description: string
  metadata?: Record<string, unknown>
}): Promise<void> {
  return _call("PUT", `/album/${id}`, body)
}

export async function addPhotoToAlbum({
  id,
  photoID,
}: {
  id: string
  photoID: string
}): Promise<void> {
  return _call("POST", `/album/${id}`, {photoID})
}

export async function listPhotos(): Promise<Photo[]> {
  return _call("GET", "/photo")
}

export async function getPhoto({id}: {id: string}): Promise<Photo> {
  return _call("GET", `/photo/${id}`)
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
  metadata?: Record<string, unknown>
  width: number
  height: number
}): Promise<{id: string; imagePresignedURL: string; thumbnailPresignedURL: string}> {
  return _call("POST", "/photo", body)
}

export async function confirmPhotoUploaded({id}: {id: string}): Promise<void> {
  return _call("PATCH", `/photo/${id}`, {})
}

export async function removePhotoFromAlbum({
  id,
  photoID,
}: {
  id: string
  photoID: string
}): Promise<void> {
  return _call("DELETE", `/album/${id}/${photoID}`)
}

export async function deletePhoto({id}: {id: string}): Promise<void> {
  return _call("DELETE", `/photo/${id}`)
}

export async function login({totp}: {totp: string}): Promise<void> {
  return _call("POST", "/auth/login", {totp})
}

export async function logout(): Promise<void> {
  return _call("POST", "/auth/logout")
}

export async function whoami(): Promise<void> {
  return _call("GET", "/auth/whoami")
}
