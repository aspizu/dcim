import * as api from "#services/api"
import {useQuery, useQueryClient} from "@tanstack/react-query"

export function useQueryPhotos() {
  const queryClient = useQueryClient()
  return useQuery({
    queryKey: ["photos"],
    queryFn: async () => {
      const photos = await api.listPhotos()
      for (const image of photos) {
        queryClient.setQueryData(["photos", image.id], image)
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
