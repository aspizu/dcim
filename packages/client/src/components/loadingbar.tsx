import {signal} from "@preact/signals-react"

const $loading = signal({progress: 0, visible: false})
const _activeLoads = new Map<string, number>()
let _interval: ReturnType<typeof setInterval> | undefined
let _showTimeout: ReturnType<typeof setTimeout> | undefined
let _hideTimeout: ReturnType<typeof setTimeout> | undefined

export function startLoading(key: string) {
  const wasLoading = _activeLoads.size > 0
  _activeLoads.set(key, (_activeLoads.get(key) ?? 0) + 1)
  if (wasLoading) return
  clearInterval(_interval)
  clearTimeout(_showTimeout)
  const {progress, visible} = $loading.value
  if (progress === 1) {
    if (visible) {
      clearTimeout(_hideTimeout)
      _hideLoading()
    }
    return
  }
  if (visible) {
    _animateLoading()
  } else {
    _scheduleLoading()
  }
}

function _scheduleLoading() {
  _showTimeout = setTimeout(() => {
    $loading.value = {progress: 0.075, visible: true}
    _animateLoading()
  }, 150)
}

function _hideLoading() {
  $loading.value = {...$loading.value, visible: false}
  _hideTimeout = setTimeout(() => {
    $loading.value = {progress: 0, visible: false}
    if (_activeLoads.size > 0) {
      _scheduleLoading()
    }
  }, 200)
}

function _animateLoading() {
  _interval = setInterval(() => {
    const state = $loading.value
    const next = state.progress + Math.max(0, 0.75 - state.progress) / 10
    if (next >= 0.749) {
      clearInterval(_interval)
      $loading.value = {...state, progress: Math.max(state.progress, 0.75)}
    } else {
      $loading.value = {...state, progress: next}
    }
  }, 1000 / 15)
}

export function stopLoading(key: string) {
  const count = _activeLoads.get(key)
  if (count === undefined) return
  if (count > 1) {
    _activeLoads.set(key, count - 1)
    return
  }
  _activeLoads.delete(key)
  if (_activeLoads.size > 0) return
  clearTimeout(_showTimeout)
  clearInterval(_interval)
  if (!$loading.value.visible) return
  _interval = setInterval(() => {
    const state = $loading.value
    const next = state.progress + (1 - state.progress) / 2
    if (1 - next < 0.001) {
      clearInterval(_interval)
      $loading.value = {...state, progress: 1}
      _hideTimeout = setTimeout(_hideLoading, 200)
    } else {
      $loading.value = {...state, progress: next}
    }
  }, 1000 / 15)
}

export function LoadingBar() {
  const {progress, visible} = $loading.value
  return (
    <div
      role="progressbar"
      aria-label="Loading"
      aria-hidden={!visible}
      className="pointer-events-none fixed top-0 right-0 left-0 z-99 h-[2px] origin-left bg-linear-to-r from-[#07551a] via-primary via-50% to-[#b8f5c3] transition-[transform,opacity] duration-200 ease-linear motion-reduce:transition-none"
      style={{
        transform: `scaleX(${progress})`,
        opacity: visible ? 1 : 0,
        transitionProperty: progress === 0 ? "none" : undefined,
      }}
    />
  )
}
