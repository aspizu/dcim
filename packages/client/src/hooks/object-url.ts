import {useEffect, useState} from "react"

export function useObjectURL(buffer: ArrayBuffer | null, type: string): string | null {
  const [url, setURL] = useState<string | null>(null)

  useEffect(() => {
    if (!buffer) {
      setURL(null)
      return
    }
    const blob = new Blob([buffer], {type})
    const objURL = URL.createObjectURL(blob)
    setURL(objURL)
    return () => {
      URL.revokeObjectURL(objURL)
    }
  }, [buffer, type])

  return url
}
