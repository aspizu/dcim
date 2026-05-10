export {ApiError, NetworkError} from "./fetch"
import {call as _call} from "./fetch"

export type ContentType = "image/png" | "image/jpeg" | "image/webp" | "image/avif"

export interface Image {
  id: string
  image_url: string
  thumbnail_url: string
  thumbhash: string
  content_sha256: string
  timestamp: string
  content_type: ContentType
  content_length: number
  file_name: string
  metadata: Record<string, unknown>
  status: string
  width: number
  height: number
}

export interface Album {
  id: string
  name: string
  description?: string
  metadata: Record<string, unknown>
  created_at: string
}

export interface AlbumDetail extends Album {
  images: {album_id: string; image_id: string}[]
}

export async function listAlbums(): Promise<Album[]> {
  return _call("GET", "/album")
}

export async function getAlbum({id}: {id: string}): Promise<AlbumDetail> {
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

export async function addImageToAlbum({
  id,
  imageID,
}: {
  id: string
  imageID: string
}): Promise<void> {
  return _call("POST", `/album/${id}`, {imageID})
}

export async function listImages(): Promise<Image[]> {
  return _call("GET", "/image")
}

export async function getImage({id}: {id: string}): Promise<Image> {
  return _call("GET", `/image/${id}`)
}

export async function createImage(body: {
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
  return _call("POST", "/image", body)
}

export async function confirmImageUploaded({id}: {id: string}): Promise<void> {
  return _call("PATCH", `/image/${id}`, {})
}

export async function deleteImage({id}: {id: string}): Promise<void> {
  return _call("DELETE", `/image/${id}`)
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
