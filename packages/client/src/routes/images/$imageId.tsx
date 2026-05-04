import {Header} from "#components/header"
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
    <>
      <Header title={image.data?.file_name ?? "Photo"} />
      <div className="p-2">
        <img src={image.data?.image_url} alt={image.data?.file_name} className="rounded-md" />
      </div>
    </>
  )
}

export const Route = createFileRoute("/images/$imageId")({component: RouteComponent})
