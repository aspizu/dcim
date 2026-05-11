import * as api from "#services/api"
import {useQuery, useQueryClient} from "@tanstack/react-query"

export function useQueryPhotos() {
  const queryClient = useQueryClient()
  return useQuery({
    queryKey: ["photos"],
    queryFn: async () => {
      const photos = await api.listPhotos()
      for (const photo of photos) {
        queryClient.setQueryData(["photos", photo.id], photo)
      }
      return photos
    },
  })
}

export function useQueryPhoto(id: string) {
  const queryClient = useQueryClient()
  return useQuery({
    queryKey: ["photos", id],
    queryFn: async () => {
      const photo = await api.getPhoto({id: id})
      queryClient.setQueryData(
        ["photos"],
        (oldPhotos?: api.Photo[]) =>
          oldPhotos &&
          oldPhotos.map((oldPhoto) => (photo.id === oldPhoto.id ? photo : oldPhoto)),
      )
      return photo
    },
  })
}

export function useQueryAlbum(id: string) {
  const queryClient = useQueryClient()
  return useQuery({
    queryKey: ["album", id],
    queryFn: async () => {
      const album = await api.getAlbum({id})
      for (const photo of album.photos) {
        queryClient.setQueryData(["photos", photo.id], photo)
      }
      return album
    },
  })
}
