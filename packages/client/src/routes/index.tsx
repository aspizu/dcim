import {createFileRoute} from "@tanstack/react-router"

const fakePictures = [
  "https://picsum.photos/id/10/200/300",
  "https://picsum.photos/id/11/200/300",
  "https://picsum.photos/id/12/200/300",
  "https://picsum.photos/id/13/200/300",
  "https://picsum.photos/id/14/200/300",
  "https://picsum.photos/id/15/200/300",
  "https://picsum.photos/id/16/200/300",
  "https://picsum.photos/id/17/200/300",
  "https://picsum.photos/id/18/200/300",
]

export const Route = createFileRoute("/")({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div>
      <h1>Home</h1>
      <div className="grid grid-cols-3 gap-2">
        {fakePictures.map((picture, index) => (
          <img key={index} src={picture} className="h-full w-full" />
        ))}
      </div>
    </div>
  )
}
