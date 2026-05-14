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

export function useQueryPhoto(id: string) {
  return useSuspenseQuery(queryPhotoOptions(id))
}

export const queryPhotosOptions = infiniteQueryOptions({
  queryKey: ["photo"],
  queryFn: async ({pageParam, client}) => {
    const res = await api.listPhotos({next: pageParam})
    for (const photo of res.photos) {
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

export function queryAlbumOptions(id: string) {
  return infiniteQueryOptions({
    queryKey: ["album", id],
    queryFn: async ({pageParam, client}) => {
      const res = await api.getAlbum({id, next: pageParam})
      for (const photo of res.photos) {
        client.setQueryData(["photo", photo.id], photo)
      }
      return res
    },
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.next,
    getPreviousPageParam: (firstPage) => firstPage.photos[0]?.id,
  })
}

export function useQueryAlbum(id: string) {
  return useSuspenseInfiniteQuery(queryAlbumOptions(id))
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
