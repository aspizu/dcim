export {ApiError, NetworkError} from "./fetch"
import {call as _call} from "./fetch"

export type ContentType = "image/png" | "image/jpeg" | "image/webp" | "image/avif"

export interface Image {
  id: string
  content_sha256: string
  timestamp: string
  content_type: ContentType
  content_length: number
  file_name: string
  metadata: Record<string, unknown>
  status: string
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

export async function getImage({key}: {key: string}): Promise<Image> {
  return _call("GET", `/image/${key}`)
}

export async function createImage(body: {
  contentSHA256: string
  timestamp: string
  contentType: ContentType
  contentLength: number
  fileName: string
  metadata?: Record<string, unknown>
}): Promise<{key: string; url: string}> {
  return _call("POST", "/image", body)
}

export async function confirmImageUploaded({key}: {key: string}): Promise<{status: string}> {
  return _call("PATCH", `/image/${key}`, {})
}

export async function login({totp}: {totp: string}): Promise<void> {
  return _call("POST", "/auth/login", {totp})
}

export async function whoami(): Promise<{}> {
  return _call("GET", "/auth/whoami")
}
