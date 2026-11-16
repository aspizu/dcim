import {QueryClient, QueryClientProvider} from "@tanstack/react-query"
import {createRouter, RouterProvider} from "@tanstack/react-router"
import {StrictMode} from "react"
import {createRoot} from "react-dom/client"

import {LoadingBar, startLoading, stopLoading} from "#components/loadingbar.tsx"
import {Toaster} from "#components/ui/sonner"

import "#styles/global.css"

import {$authState, AuthState, initializeAuth} from "#stores/auth"
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

let _routerLoading = false

router.subscribe("onBeforeLoad", () => {
  if (_routerLoading) return
  _routerLoading = true
  startLoading("router")
})

router.subscribe("onResolved", () => {
  if (!_routerLoading) return
  _routerLoading = false
  stopLoading("router")
})

$theme.subscribe((theme) => {
  if (theme === Theme.DARK) {
    document.documentElement.classList.add("dark")
  } else {
    document.documentElement.classList.remove("dark")
  }
})

void initializeAuth(router)

function App() {
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
