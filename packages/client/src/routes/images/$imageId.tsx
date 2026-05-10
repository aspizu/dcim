import {Header} from "#components/header"
import * as api from "#services/api"
import {useQuery} from "@tanstack/react-query"
import {createFileRoute} from "@tanstack/react-router"

function RouteComponent() {
  const {imageId} = Route.useParams()
  const {data} = useQuery({
    queryKey: ["images", imageId],
    queryFn: () => api.getImage({id: imageId}),
  })

  return (
    <div className="h-dvh">
      <Header title={data?.file_name ?? "Photo"} />
      <div></div>
    </div>
  )
}

export const Route = createFileRoute("/images/$imageId")({component: RouteComponent})
