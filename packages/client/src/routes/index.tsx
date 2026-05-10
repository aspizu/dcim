import {Header} from "#components/header"
import {UserHeaderMenu} from "#components/header-menus/user-header-menu"
import {ImgFaded} from "#components/img-faded"
import {UploadButton} from "#components/upload-button"
import * as api from "#services/api"
import {useQuery} from "@tanstack/react-query"
import {createFileRoute, Link} from "@tanstack/react-router"

function PhotoItem(props: {photo: api.Photo}) {
  return (
    <Link to={`/photo/$id`} params={{id: props.photo.id}}>
      <div
        className="relative aspect-square overflow-hidden rounded-md"
        style={{
          viewTransitionName: `image-${props.photo.id}`,
        }}
      >
        <ImgFaded
          src={`data:image/avif;base64,${props.photo.thumbhash}`}
          alt={props.photo.file_name}
          className="absolute inset-0 h-full w-full scale-[1.05] object-cover blur-md"
          style={{
            aspectRatio: `${props.photo.width / props.photo.height}`,
          }}
        />
        <ImgFaded
          src={props.photo.thumbnail_url}
          alt={props.photo.file_name}
          className="absolute inset-0 h-full w-full object-cover"
        />
      </div>
    </Link>
  )
}

function RouteComponent() {
  const photos = useQuery({
    queryKey: ["photos"],
    queryFn: api.listPhotos,
  })
  return (
    <>
      <Header title="Photos" before={<UploadButton />} after={<UserHeaderMenu />} />
      <div className="grid grid-cols-3 gap-2 p-2 pt-0">
        {photos.data?.map((photo) => (
          <PhotoItem key={photo.id} photo={photo} />
        ))}
      </div>
    </>
  )
}

export const Route = createFileRoute("/")({
  component: RouteComponent,
})
