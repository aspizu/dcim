export type * from "./fetch"
import {call} from "./fetch"

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

export async function getAlbum({id}: {id: string}): Promise<Album> {
  return call("GET", `/album/${id}`)
}

export async function listAlbums(): Promise<Array<Album & {cover: Photo | null}>> {
  return call("GET", "/album")
}

export async function listAlbumPhotos(opts: {
  id: string
  next?: string
}): Promise<{photos: Photo[]; next: string | null}> {
  return call(
    "GET",
    opts.next ? `/album/${opts.id}/photo?next=${opts.next}` : `/album/${opts.id}/photo`,
  )
}

export async function createAlbum(body: {name: string}): Promise<{id: string}> {
  return call("POST", "/album", body)
}

export async function updateAlbum({id, ...body}: {id: string; name: string}): Promise<void> {
  return call("PATCH", `/album/${id}`, body)
}

export async function addPhotoToAlbum(opts: {id: string; photoID: string}): Promise<void> {
  return call("POST", `/album/${opts.id}/${opts.photoID}`)
}

export async function listPhotos(opts: {
  next?: string
}): Promise<{next: string | null; photos: Photo[]}> {
  const qs = opts.next ? `?next=${encodeURIComponent(opts.next)}` : ""
  return call("GET", `/photo${qs}`)
}

export async function listPhotosByAlbum(opts: {
  album: string
  next?: string
}): Promise<{next: string | null; photos: (Photo & {in_album: boolean})[]}> {
  const params = new URLSearchParams()
  if (opts.next) {
    params.set("next", opts.next)
  }
  const qs = params.toString()
  return call(
    "GET",
    qs ? `/photo/by-album/${opts.album}?${qs}` : `/photo/by-album/${opts.album}`,
  )
}

export async function getPhoto(opts: {
  id: string
}): Promise<Photo & {next: string | null; prev: string | null}> {
  return call("GET", `/photo/${opts.id}`)
}

export async function getAlbumPhoto(opts: {
  album: string
  photo: string
}): Promise<Photo & {next: string | null; prev: string | null}> {
  return call("GET", `/album/${opts.album}/photo/${opts.photo}`)
}

export async function createPhoto(body: {
  fileName: string
  image: {contentType: string; contentSHA256: string; contentLength: number}
  thumbnail: {contentType: string; contentSHA256: string; contentLength: number}
  thumbhash: string
  width: number
  height: number
  metadata: Record<string, unknown>
}): Promise<{id: string; imagePresignedURL: string; thumbnailPresignedURL: string}> {
  return call("POST", "/photo", body)
}

export async function confirmPhotoUploaded(opts: {id: string}): Promise<void> {
  return call("POST", `/photo/${opts.id}/mark-as-uploaded`)
}

export async function removePhotoFromAlbum(opts: {id: string; photoID: string}): Promise<void> {
  return call("DELETE", `/album/${opts.id}/${opts.photoID}`)
}

export async function deletePhoto({id}: {id: string}): Promise<void> {
  return call("DELETE", `/photo/${id}`)
}

export async function deleteAlbum({id}: {id: string}): Promise<void> {
  return call("DELETE", `/album/${id}`)
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

export async function storage(): Promise<{photo_count: number; total_used: number}> {
  return call("GET", "/storage")
}

export async function getConfig(): Promise<Record<string, string>> {
  return call("GET", "/config")
}

export async function setConfig(key: string, value: string): Promise<void> {
  call("PUT", `/config/${key}`, {value})
}
