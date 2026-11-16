import {signal} from "@preact/signals-react"
import type {RegisteredRouter} from "@tanstack/react-router"

import {startLoading, stopLoading} from "#components/loadingbar.tsx"
import * as api from "#services/api"
import {pullConfig} from "#stores/settings"

export enum AuthState {
  LOADING,
  UNAUTHENTICATED,
  AUTHENTICATED,
}

export const $authState = signal<AuthState>(AuthState.LOADING)

export async function initializeAuth(router: RegisteredRouter) {
  startLoading("whoami")
  try {
    await api.whoami()
    await pullConfig().catch((error) => {
      console.error("Failed to load config", error)
    })
    $authState.value = AuthState.AUTHENTICATED
  } catch {
    $authState.value = AuthState.UNAUTHENTICATED
    const {pathname} = router.state.location
    if (["/", "/settings", "/albums"].includes(pathname)) {
      void router.navigate({
        to: "/login",
        replace: true,
        search: pathname === "/" ? {} : {redirect: pathname.slice(1)},
      })
    }
  } finally {
    stopLoading("whoami")
  }
}
