import {Spinner} from "#components/ui/spinner"
import * as api from "#services/api"
import {$authState, AuthState} from "#stores/auth"
import {Outlet, createRootRoute} from "@tanstack/react-router"
import {useAtom} from "jotai"
import * as React from "react"

export const Route = createRootRoute({
  component: RootComponent,
})

function RootComponent() {
  const [authState, setAuthState] = useAtom($authState)
  React.useEffect(() => {
    if (authState !== AuthState.LOADING) return
    api
      .whoami()
      .then(() => {
        setAuthState(AuthState.AUTHENTICATED)
      })
      .catch(() => {
        setAuthState(AuthState.UNAUTHENTICATED)
      })
  }, [authState, setAuthState])
  if (authState === AuthState.LOADING) {
    return (
      <div className="grid h-dvh place-items-center">
        <Spinner />
      </div>
    )
  }
  return (
    <React.Fragment>
      <Outlet />
    </React.Fragment>
  )
}
