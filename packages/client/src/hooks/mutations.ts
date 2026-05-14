import {useMutation, useQueryClient} from "@tanstack/react-query"

import * as api from "#services/api"

export function useDeletePhoto() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.deletePhoto({id}),
    onSuccess: () => {
      void queryClient.invalidateQueries({queryKey: ["photo"]})
      void queryClient.invalidateQueries({queryKey: ["album"]})
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

export function useCreateAlbum() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (name: string) => api.createAlbum({name}),
    onSuccess: () => {
      void queryClient.invalidateQueries({queryKey: ["album"]})
    },
  })
}
