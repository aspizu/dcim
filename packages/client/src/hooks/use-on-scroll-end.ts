import {useEffect, useRef} from "react"

export function useOnScrollEnd(
  callback: () => Promise<unknown>,
  element?: HTMLElement | {current: HTMLElement | null},
) {
  const isFetching = useRef(false)
  useEffect(() => {
    async function _onScrollEnd() {
      if (isFetching.current) return
      isFetching.current = true
      await callback()
      isFetching.current = false
    }
    function _eventListener() {
      void _onScrollEnd()
    }
    const el = element ? ("current" in element ? element.current : element) : window
    if (!el) {
      return undefined
    }
    el.addEventListener("scrollend", _eventListener)
    return () => {
      el.removeEventListener("scrollend", _eventListener)
    }
  }, [callback, element])
}
