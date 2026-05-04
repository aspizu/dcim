import {Header} from "#components/header"
import {createFileRoute} from "@tanstack/react-router"

function RouteComponent() {
  return (
    <>
      <Header title="Settings" />
    </>
  )
}

export const Route = createFileRoute("/settings")({component: RouteComponent})
