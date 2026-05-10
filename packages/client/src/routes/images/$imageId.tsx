import {Header} from "#components/header"
import {ImageHeaderMenu} from "#components/header-menus/image-header-menu"
import {ImgFaded} from "#components/img-faded"
import * as api from "#services/api"
import {useQuery} from "@tanstack/react-query"
import {createFileRoute} from "@tanstack/react-router"

function RouteComponent() {
  const {imageId} = Route.useParams()
  const image = useQuery({
    queryKey: ["images", imageId],
    queryFn: () => api.getImage({id: imageId}),
  })
  return (
    <div className="flex h-dvh flex-col">
      <Header
        title={image.data?.file_name ?? "Photo"}
        after={image.data && <ImageHeaderMenu image={image.data} />}
      />
      {image.data && (
        <div
          className="relative overflow-hidden"
          style={{
            aspectRatio: `${image.data.width / image.data.height}`,
            viewTransitionName: `image-${imageId}`,
          }}
        >
          <div
            className="absolute top-[50%] left-[50%] h-full -translate-x-[50%] -translate-y-[50%] overflow-hidden"
            style={{
              aspectRatio: `${image.data.width / image.data.height}`,
            }}
          >
            <ImgFaded
              src={`data:image/avif;base64,${image.data.thumbhash}`}
              alt={image.data.file_name}
              className="h-full w-full scale-[1.05] object-fill blur-md"
            />
          </div>
          <ImgFaded
            src={image.data.image_url}
            alt={image.data.file_name}
            className="absolute inset-0 h-full w-full object-contain"
          />
        </div>
      )}
    </div>
  )
}

export const Route = createFileRoute("/images/$imageId")({component: RouteComponent})
