import {Header} from "#components/header"
import {UploadButton} from "#components/upload-button"
import * as api from "#services/api"
import {useQuery} from "@tanstack/react-query"
import {createFileRoute, Link} from "@tanstack/react-router"

function ImageItem(props: {image: api.Image}) {
  return (
    <Link to={`/images/$imageId`} params={{imageId: props.image.id}}>
      <img
        src={props.image.thumbnail_url}
        alt={props.image.file_name}
        className="aspect-square rounded-md object-cover"
      />
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
      <div className="grid grid-cols-3 gap-2 p-2">
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
