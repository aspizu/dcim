import {createFileRoute} from "@tanstack/react-router"

import {Header} from "#components/header"

function RouteComponent() {
  return (
    <>
      <Header title="Settings" />
    </>
  )
}

export const Route = createFileRoute("/settings")({component: RouteComponent})
