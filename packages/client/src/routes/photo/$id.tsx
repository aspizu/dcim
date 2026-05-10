import {Header} from "#components/header"
import {PhotoHeaderMenu} from "#components/header-menus/image-header-menu"
import {ImgFaded} from "#components/img-faded"
import * as api from "#services/api"
import {useQuery} from "@tanstack/react-query"
import {createFileRoute} from "@tanstack/react-router"

function RouteComponent() {
  const {id} = Route.useParams()
  const photo = useQuery({
    queryKey: ["photos", id],
    queryFn: () => api.getPhoto({id: id}),
  })
  return (
    <div className="grid h-dvh grid-rows-[auto_1fr]">
      <Header
        title={photo.data?.file_name ?? "Photo"}
        after={photo.data && <PhotoHeaderMenu photo={photo.data} />}
      />
      {photo.data && (
        <div className="grid">
          <div
            className="relative h-full place-self-center overflow-hidden"
            style={{
              aspectRatio: `${photo.data.width / photo.data.height}`,
              viewTransitionName: `photo-${photo.data.id}`,
            }}
          >
            <img
              src={`data:image/avif;base64,${photo.data.thumbhash}`}
              alt={photo.data.file_name}
              className="absolute inset-0 h-full w-full scale-[1.05] blur-md"
            />
            <ImgFaded
              src={photo.data.image_url}
              alt={photo.data.file_name}
              className="absolute inset-0"
            />
          </div>
        </div>
      )}
    </div>
  )
}

export const Route = createFileRoute("/photo/$id")({component: RouteComponent})
