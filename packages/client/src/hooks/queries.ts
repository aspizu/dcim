import {
  infiniteQueryOptions,
  queryOptions,
  useSuspenseInfiniteQuery,
  useSuspenseQuery,
} from "@tanstack/react-query"

import * as api from "#services/api"

export function queryPhotoOptions(id: string) {
  return queryOptions({
    queryKey: ["photo", id],
    queryFn: async () => api.getPhoto({id}),
  })
}

export function queryAlbumPhotoOptions(album: string, photo: string) {
  return queryOptions({
    queryKey: ["album", album, "photo", photo],
    queryFn: async () => api.getAlbumPhoto({photo, album}),
  })
}

export function useQueryAlbumPhoto(album: string, photo: string) {
  return useSuspenseQuery(queryAlbumPhotoOptions(album, photo))
}

export function useQueryPhoto(id: string) {
  return useSuspenseQuery(queryPhotoOptions(id))
}

export const queryPhotosOptions = infiniteQueryOptions({
  queryKey: ["photo"],
  queryFn: async ({pageParam, client}) => {
    const res = await api.listPhotos({next: pageParam})
    for (let i = 0; i < res.photos.length; i++) {
      const prev = res.photos[i - 1]?.id ?? null
      const next = res.photos[i + 1]?.id ?? res.next ?? null
      const photo = {...res.photos[i], prev, next}
      client.setQueryData(["photo", photo.id], photo)
    }
    return res
  },
  initialPageParam: undefined as string | undefined,
  getNextPageParam: (lastPage) => lastPage.next,
  getPreviousPageParam: (firstPage) => firstPage.photos[0]?.id,
})

export function useQueryPhotos() {
  return useSuspenseInfiniteQuery(queryPhotosOptions)
}

export function queryAlbumPhotosOptions(id: string) {
  return infiniteQueryOptions({
    queryKey: ["album", id, "photo"],
    queryFn: async ({pageParam, client}) => {
      const res = await api.listAlbumPhotos({id, next: pageParam})
      for (const photo of res.photos) {
        client.setQueryData(["album", id, "photo", photo.id], photo)
      }
      return res
    },
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.next,
    getPreviousPageParam: (firstPage) => firstPage.photos[0]?.id,
  })
}

export function useQueryAlbumPhotos(id: string) {
  return useSuspenseInfiniteQuery(queryAlbumPhotosOptions(id))
}

export const queryAlbumsOptions = queryOptions({
  queryKey: ["album"],
  queryFn: async ({client}) => {
    const res = await api.listAlbums()
    for (const album of res) {
      if (!album.cover) continue
      client.setQueryData(["photo", album.cover.id], album.cover)
    }
    return res
  },
})

export function useQueryAlbums() {
  return useSuspenseQuery(queryAlbumsOptions)
}

export function queryAlbumOptions(id: string) {
  return queryOptions({
    queryKey: ["album", id],
    queryFn: async ({client}) => {
      const res = await api.getAlbum({id})
      client.setQueryData(["album", id], res)
      return res
    },
  })
}

export function useQueryAlbum(id: string) {
  return useSuspenseQuery(queryAlbumOptions(id))
}

export type QueryData<T extends (...args: any[]) => {data: unknown}> = ReturnType<T>["data"]
