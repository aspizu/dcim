import {signal} from "@preact/signals-react"

type LoadingState = {
  progress: number
  visible: boolean
  phase: "idle" | "loading" | "finishing"
  keys: Record<string, number>
}

const $loading = signal<LoadingState>({
  progress: 0,
  visible: false,
  phase: "idle",
  keys: {},
})

let interval: ReturnType<typeof setInterval>

function _hasAnyActive(keys: Record<string, number>) {
  return Object.values(keys).some((v) => v > 0)
}

function _load75() {
  const s = $loading.value

  const next = s.progress + (0.75 - s.progress) / 10

  $loading.value = {
    ...s,
    progress: next,
  }

  if (Math.abs(0.75 - next) < 0.001) {
    clearInterval(interval)
    $loading.value = {
      ...$loading.value,
      progress: 0.75,
    }
  }
}

function _load100() {
  const s = $loading.value

  const next = s.progress + (1.0 - s.progress) / 2

  $loading.value = {
    ...s,
    progress: next,
  }

  if (Math.abs(1.0 - next) < 0.001) {
    clearInterval(interval)

    const done = {
      ...$loading.value,
      progress: 1.0,
    }

    $loading.value = done

    setTimeout(() => {
      $loading.value = {
        ...done,
        visible: false,
        phase: "idle",
        keys: {},
      }

      setTimeout(() => {
        $loading.value = {
          progress: 0,
          visible: false,
          phase: "idle",
          keys: {},
        }
      }, 200)
    }, 200)
  }
}

export function startLoading(key: string) {
  console.debug("startLoading", key)
  const s = $loading.value

  const nextKeys = {...s.keys}
  nextKeys[key] = (nextKeys[key] ?? 0) + 1

  if (s.phase !== "idle") {
    $loading.value = {
      ...s,
      keys: nextKeys,
      visible: true,
    }
    return
  }

  clearInterval(interval)

  $loading.value = {
    progress: 0,
    visible: true,
    phase: "loading",
    keys: nextKeys,
  }

  interval = setInterval(_load75, 1000 / 15)
}

export function stopLoading(key: string) {
  console.debug("stopLoading", key)
  const s = $loading.value

  const nextKeys = {...s.keys}

  if (!nextKeys[key]) return

  nextKeys[key]--

  if (nextKeys[key] <= 0) {
    delete nextKeys[key]
  }

  if (_hasAnyActive(nextKeys)) {
    $loading.value = {
      ...s,
      keys: nextKeys,
    }
    return
  }

  clearInterval(interval)

  $loading.value = {
    ...s,
    keys: nextKeys,
    phase: "finishing",
  }

  interval = setInterval(_load100, 1000 / 15)
}

export function LoadingBar() {
  const {progress, visible} = $loading.value

  return (
    <div
      className="fixed top-0 right-0 left-0 z-99 h-1 bg-primary"
      style={{
        width: `${progress * 100}%`,
        opacity: visible ? 1 : 0,
        transition: "width 40ms linear, opacity 200ms ease",
      }}
    />
  )
}
