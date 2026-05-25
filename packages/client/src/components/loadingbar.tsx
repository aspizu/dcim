import {signal} from "@preact/signals-react"

const $progress = signal(0.0)
const $visible = signal(false)
let interval: ReturnType<typeof setInterval>

function _load75() {
  $progress.value += (0.75 - $progress.value) / 10
  if (Math.abs(0.75 - $progress.value) < 0.001) {
    clearInterval(interval)
  }
}

function _load100() {
  $progress.value += (1.0 - $progress.value) / 2
  if (Math.abs(1.0 - $progress.value) < 0.001) {
    clearInterval(interval)
    $progress.value = 1.0
    setTimeout(() => {
      $visible.value = false
      setTimeout(() => {
        $progress.value = 0
      }, 200)
    }, 200)
  }
}

export function startLoading() {
  clearInterval(interval)
  $progress.value = 0
  $visible.value = true
  interval = setInterval(_load75, 1000 / 15)
}

export function stopLoading() {
  clearInterval(interval)
  interval = setInterval(_load100, 1000 / 15)
}

export function LoadingBar() {
  return (
    <div
      className="fixed top-0 right-0 left-0 z-99 h-1 bg-primary"
      style={{
        width: `${$progress.value * 100}%`,
        opacity: $visible.value ? 1 : 0,
        transition: "width 40ms linear, opacity 200ms ease",
      }}
    />
  )
}
