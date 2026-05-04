import {signal} from "@preact/signals-react"

export enum AuthState {
  LOADING,
  UNAUTHENTICATED,
  AUTHENTICATED,
}

export const $authState = signal<AuthState>(AuthState.LOADING)
