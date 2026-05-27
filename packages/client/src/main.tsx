import {QueryClient, QueryClientProvider} from "@tanstack/react-query"
import {createRouter, RouterProvider} from "@tanstack/react-router"
import {StrictMode, useEffect} from "react"
import {createRoot} from "react-dom/client"

import {LoadingBar, startLoading, stopLoading} from "#components/loadingbar.tsx"
import {Toaster} from "#components/ui/sonner"
import {pullConfig} from "#lib/config"
import * as api from "#services/api"

import "#styles/global.css"

import {$authState, AuthState} from "#stores/auth"
import {$theme, Theme} from "#stores/themes"

import {routeTree} from "./routeTree.gen"

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router
  }
}

export const queryClient = new QueryClient()
const router = createRouter({
  routeTree,
  defaultViewTransition: true,
  scrollRestoration: true,
})

router.subscribe("onBeforeNavigate", ({pathChanged}) => {
  if (pathChanged) {
    startLoading("router")
  }
})

router.subscribe("onResolved", () => {
  stopLoading("router")
})

$theme.subscribe((theme) => {
  if (theme === Theme.DARK) {
    document.documentElement.classList.add("dark")
  } else {
    document.documentElement.classList.remove("dark")
  }
})

function App() {
  useEffect(() => {
    if ($authState.value !== AuthState.LOADING) return
    startLoading("whoami")
    api
      .whoami()
      .then(async () => {
        await pullConfig()
        $authState.value = AuthState.AUTHENTICATED
        stopLoading("whoami")
      })
      .catch(() => {
        $authState.value = AuthState.UNAUTHENTICATED
        stopLoading("whoami")
        if (["/", "/settings", "/albums"].includes(router.state.location.pathname)) {
          void router.navigate({
            to: "/login",
            replace: true,
            search: {redirect: router.state.location.pathname},
          })
        }
      })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [$authState.value])
  if ($authState.value === AuthState.LOADING) {
    return null
  }
  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  )
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <LoadingBar />
    <App />
    <Toaster position="bottom-center" />
  </StrictMode>,
)
