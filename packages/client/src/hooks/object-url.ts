import {useSignal} from "@preact/signals-react"
import {useEffect} from "react"

/** Creates an object URL for the current buffer and MIME type, revoking it on cleanup. */
export function useObjectURL(buffer: ArrayBuffer | null, type: string): string | null {
  const state = useSignal<{
    key: ArrayBuffer
    type: string
    url: string
  } | null>(null)
  useEffect(() => {
    if (!buffer) return
    const blob = new Blob([buffer], {type})
    const url = URL.createObjectURL(blob)
    state.value = {key: buffer, type, url}
    return () => {
      URL.revokeObjectURL(url)
      state.value = null
    }
  }, [buffer, type, state])
  const current = state.value
  return current?.key === buffer && current.type === type ? current.url : null
}
