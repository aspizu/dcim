import {useEffect, useRef} from "react"

export function useOnScrollEnd(
  callback: () => Promise<unknown>,
  element?: HTMLElement | {current: HTMLElement | null},
) {
  const isFetching = useRef(false)
  const el = element ? ("current" in element ? element.current : element) : window
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
    if (!el) {
      return undefined
    }
    el.addEventListener("scrollend", _eventListener)
    return () => {
      el.removeEventListener("scrollend", _eventListener)
    }
  }, [callback, el])
}
