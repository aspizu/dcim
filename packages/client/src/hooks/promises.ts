import {useCallback, useEffect, useState} from "react"

export function useAsync<T>(fn: () => Promise<T>, deps: unknown[] = []) {
  const [value, setValue] = useState<T | null>(null)
  const [error, setError] = useState<Error | null>(null)
  const [loading, setLoading] = useState<boolean>(false)

  const execute = useCallback(async () => {
    let isCurrent = true
    setLoading(true)
    setError(null)

    try {
      const result = await fn()
      if (isCurrent) {
        setValue(result)
      }
    } catch (err) {
      if (isCurrent) {
        setError(err instanceof Error ? err : new Error(String(err)))
      }
    } finally {
      if (isCurrent) {
        setLoading(false)
      }
    }

    return () => {
      isCurrent = false
    }
    // eslint-disable-next-line react-hooks/use-memo, react-hooks/exhaustive-deps
  }, deps)

  useEffect(() => {
    const cleanup = execute()
    return () => {
      void cleanup.then((cancel) => cancel())
    }
  }, [execute])

  return {value, error, loading, retry: execute}
}
