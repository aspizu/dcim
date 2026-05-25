import {
  infiniteQueryOptions,
  queryOptions,
  useSuspenseInfiniteQuery,
  useSuspenseQuery,
  type InfiniteData,
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

    const existing = client.getQueryData(queryPhotosOptions.queryKey) as
      | InfiniteData<typeof res>
      | undefined
    const prevPage = existing?.pages.find((p) => p.next === pageParam)
    const firstItemPrev = prevPage?.photos.at(-1)?.id ?? null

    for (let i = 0; i < res.photos.length; i++) {
      const prev = i === 0 ? firstItemPrev : res.photos[i - 1].id
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

export function queryPhotosByAlbumOptions(album: string) {
  return infiniteQueryOptions({
    queryKey: ["photo-by-album", album],
    queryFn: async ({pageParam}) => {
      const res = await api.listPhotosByAlbum({next: pageParam, album})
      return res
    },
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.next,
    getPreviousPageParam: (firstPage) => firstPage.photos[0]?.id,
  })
}

export function useQueryPhotos() {
  return useSuspenseInfiniteQuery(queryPhotosOptions)
}

export function useQueryPhotosByAlbum(album: string) {
  return useSuspenseInfiniteQuery(queryPhotosByAlbumOptions(album))
}

export function queryAlbumPhotosOptions(id: string) {
  return infiniteQueryOptions({
    queryKey: ["album", id, "photo"],
    queryFn: async ({pageParam, client}) => {
      const res = await api.listAlbumPhotos({id, next: pageParam})

      const existing = client.getQueryData(queryAlbumPhotosOptions(id).queryKey) as
        | InfiniteData<typeof res>
        | undefined
      const prevPage = existing?.pages.find((p) => p.next === pageParam)
      const firstItemPrev = prevPage?.photos.at(-1)?.id ?? null

      for (let i = 0; i < res.photos.length; i++) {
        const prev = i === 0 ? firstItemPrev : res.photos[i - 1].id
        const next = res.photos[i + 1]?.id ?? res.next ?? null
        const photo = {...res.photos[i], prev, next}
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

export const queryStorageOptions = queryOptions({
  queryKey: ["storage"],
  queryFn: async () => {
    const res = await api.storage()
    return res
  },
})

export function useQueryStorage() {
  return useSuspenseQuery(queryStorageOptions)
}
