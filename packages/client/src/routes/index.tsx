import {Header} from "#components/header"
import {UploadButton} from "#components/upload-button"
import * as api from "#services/api"
import {useQuery} from "@tanstack/react-query"
import {createFileRoute, Link} from "@tanstack/react-router"

function ImageItem(props: {image: api.Image}) {
  return (
    <Link
      to={`/images/$imageId`}
      params={{imageId: props.image.id}}
      viewTransition
      style={{
        viewTransitionName: `image-${props.image.id}`,
      }}
    >
      <div className="relative aspect-square overflow-hidden rounded-md">
        <img
          src={`data:image/avif;base64,${props.image.thumbhash}`}
          alt={props.image.file_name}
          className="absolute inset-0 h-full w-full scale-[1.05] blur-md"
        />
        <img
          src={props.image.thumbnail_url}
          alt={props.image.file_name}
          className="absolute inset-0 h-full w-full object-cover"
        />
      </div>
    </Link>
  )
}

function RouteComponent() {
  const images = useQuery({
    queryKey: ["images"],
    queryFn: api.listImages,
  })
  return (
    <>
      <Header title="Photos" before={<UploadButton />} />
      <div className="grid grid-cols-3 gap-2 p-2 pt-0">
        {images.data?.map((image) => (
          <ImageItem key={image.id} image={image} />
        ))}
      </div>
    </>
  )
}

export const Route = createFileRoute("/")({
  component: RouteComponent,
})
