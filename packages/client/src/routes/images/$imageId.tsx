import {Header} from "#components/header"
import {cn} from "#lib/utils"
import * as api from "#services/api"
import {useQuery} from "@tanstack/react-query"
import {createFileRoute} from "@tanstack/react-router"
import {useState} from "react"

function RouteComponent() {
  const {imageId} = Route.useParams()
  const {data} = useQuery({
    queryKey: ["images", imageId],
    queryFn: () => api.getImage({id: imageId}),
  })

  return (
    <>
      <Header title={data?.file_name ?? "Photo"} />
      <div className="grid place-items-center p-4">
        <ProgressiveImage
          key={imageId}
          src={data?.image_url}
          thumbnail={data?.thumbnail_url}
          alt={data?.file_name}
        />
      </div>
    </>
  )
}

function ProgressiveImage({
  src,
  thumbnail,
  alt,
}: {
  src?: string
  thumbnail?: string
  alt?: string
}) {
  const [loaded, setLoaded] = useState(false)

  return (
    <div className="relative w-full max-w-2xl overflow-hidden rounded-md">
      <img src={thumbnail} alt={alt} className="block h-auto w-full blur-xs" />
      {src && (
        <img
          src={src}
          alt={alt}
          onLoad={() => setLoaded(true)}
          className={cn(
            "absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ease-in-out",
            loaded ? "opacity-100" : "opacity-0",
          )}
        />
      )}
    </div>
  )
}

export const Route = createFileRoute("/images/$imageId")({component: RouteComponent})
