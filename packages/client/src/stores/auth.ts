import {atom} from "jotai"

export enum AuthState {
  LOADING,
  UNAUTHENTICATED,
  AUTHENTICATED,
}

export const $authState = atom<AuthState>(AuthState.LOADING)
