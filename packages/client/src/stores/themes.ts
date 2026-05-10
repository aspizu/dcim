import {signal} from "@preact/signals-react"

export enum Theme {
  LIGHT = "light",
  DARK = "dark",
}

const media = window.matchMedia("(prefers-color-scheme: dark)")

export const $theme = signal<Theme>(media.matches ? Theme.DARK : Theme.LIGHT)

media.addEventListener("change", (event) => {
  $theme.value = event.matches ? Theme.DARK : Theme.LIGHT
})
