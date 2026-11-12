import {useSignal} from "@preact/signals-react"
import {useCallback, useEffect} from "react"

export function useAsync<T>(fn: () => Promise<T>) {
  const state = useSignal<{value: T | null; error: Error | null; loading: boolean}>({
    value: null,
    error: null,
    loading: false,
  })
  const request = useSignal(0)
  const execute = useCallback(async () => {
    const id = request.peek() + 1
    request.value = id
    state.value = {...state.value, error: null, loading: true}
    try {
      const value = await fn()
      if (id !== request.peek()) return
      state.value = {value, error: null, loading: false}
    } catch (err) {
      if (id !== request.peek()) return
      state.value = {
        ...state.value,
        error: err instanceof Error ? err : new Error(String(err)),
        loading: false,
      }
    }
  }, [fn, request, state])
  useEffect(() => {
    void execute()
    return () => {
      request.value++
    }
  }, [execute, request])
  return {...state.value, retry: execute}
}
