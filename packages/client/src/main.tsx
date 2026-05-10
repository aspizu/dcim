import {Spinner} from "#components/ui/spinner"
import * as api from "#services/api"
import {$authState, AuthState} from "#stores/auth"
import "#styles/global.css"
import {QueryClient, QueryClientProvider} from "@tanstack/react-query"
import {createRouter, RouterProvider} from "@tanstack/react-router"
import {StrictMode, useEffect} from "react"
import {createRoot} from "react-dom/client"
import {routeTree} from "./routeTree.gen"

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router
  }
}

const queryClient = new QueryClient()
const router = createRouter({
  routeTree,
  defaultViewTransition: true,
  scrollRestoration: true,
})

function App() {
  useEffect(() => {
    if ($authState.value !== AuthState.LOADING) return
    api
      .whoami()
      .then(() => {
        $authState.value = AuthState.AUTHENTICATED
      })
      .catch(() => {
        $authState.value = AuthState.UNAUTHENTICATED
        if (["/", "/settings"].includes(window.location.pathname)) {
          void router.navigate({
            to: "/login",
            replace: true,
            search: {redirect: window.location.pathname},
          })
        }
      })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [$authState.value])
  if ($authState.value === AuthState.LOADING) {
    return (
      <div className="grid h-dvh place-items-center">
        <Spinner />
      </div>
    )
  }
  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  )
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
