import {signal} from "@preact/signals-react"

export enum Theme {
  LIGHT = "light",
  DARK = "dark",
}

export type ThemePreference = "light" | "dark" | "system"

const media = window.matchMedia("(prefers-color-scheme: dark)")

function _resolveTheme(pref: ThemePreference): Theme {
  return pref === "system" ? (media.matches ? Theme.DARK : Theme.LIGHT) : (pref as Theme)
}

function _loadPreference(): ThemePreference {
  return (localStorage.getItem("theme") as ThemePreference) || "system"
}

export const $themePreference = signal<ThemePreference>(_loadPreference())
export const $theme = signal<Theme>(_resolveTheme($themePreference.value))

export function setThemePreference(pref: ThemePreference) {
  $themePreference.value = pref
  $theme.value = _resolveTheme(pref)
  localStorage.setItem("theme", pref)
}

media.addEventListener("change", () => {
  if ($themePreference.value === "system") {
    $theme.value = _resolveTheme("system")
  }
})
