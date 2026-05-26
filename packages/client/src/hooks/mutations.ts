import {useMutation, useQueryClient, type Query} from "@tanstack/react-query"

import * as api from "#services/api"

export function useUpdatePhotoCaption() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({id, caption}: {id: string; caption: string | null}) =>
      api.updatePhotoCaption({id, caption}),
    onMutate: async ({id, caption}) => {
      await queryClient.cancelQueries({queryKey: ["photo", id]})
      queryClient.setQueriesData<api.Photo>({queryKey: ["photo", id]}, (old) =>
        old ? {...old, caption} : old,
      )

      function _isAlbumPhotoId(query: Query) {
        const key = query.queryKey
        return key.length === 4 && key[0] === "album" && key[2] === "photo" && key[3] === id
      }
      await queryClient.cancelQueries({predicate: _isAlbumPhotoId})
      queryClient.setQueriesData<api.Photo>({predicate: _isAlbumPhotoId}, (old) =>
        old ? {...old, caption} : old,
      )
    },
    onSettled: () => {
      void queryClient.invalidateQueries({queryKey: ["photo"]})
    },
  })
}

export function useDeletePhoto() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.deletePhoto({id}),
    onSuccess: () => {
      void queryClient.invalidateQueries({queryKey: ["photo"]})
      void queryClient.invalidateQueries({queryKey: ["album"]})
      void queryClient.invalidateQueries({queryKey: ["storage"]})
    },
  })
}

export function useRemovePhotoFromAlbum(album: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (photo: string) => api.removePhotoFromAlbum({id: album, photoID: photo}),
    onSuccess: () => {
      void queryClient.invalidateQueries({queryKey: ["album", album]})
    },
  })
}

export function useAddPhotoToAlbum(album: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (photo: string) => api.addPhotoToAlbum({id: album, photoID: photo}),
    onSuccess: () => {
      void queryClient.invalidateQueries({queryKey: ["album", album]})
    },
  })
}

export function useUpdateAlbum(album: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (name: string) => api.updateAlbum({id: album, name}),
    onSuccess: () => {
      void queryClient.invalidateQueries({queryKey: ["album", album]})
    },
  })
}

export function useDeleteAlbum() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.deleteAlbum({id}),
    onSuccess: () => {
      void queryClient.invalidateQueries({queryKey: ["album"]})
    },
  })
}

export function useCreateAlbum() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (name: string) => api.createAlbum({name}),
    onSuccess: () => {
      void queryClient.invalidateQueries({queryKey: ["album"]})
    },
  })
}
