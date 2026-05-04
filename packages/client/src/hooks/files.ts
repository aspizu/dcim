import {useEffect, useState} from "react"

export function useObjectURL(src: Blob | MediaSource | null | undefined) {
  const [objectURL, setObjectURL] = useState<string | null>(null)
  useEffect(() => {
    if (!src) return
    const objectURL = URL.createObjectURL(src)
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setObjectURL(objectURL)
    return () => {
      URL.revokeObjectURL(objectURL)
    }
  }, [src])
  return objectURL
}

export function useFile(src: FileSystemFileHandle) {
  const [file, setFile] = useState<File | null>()
  useEffect(() => {
    if (src === null) return
    src
      .getFile()
      .then(setFile)
      .catch(() => {})
  }, [src])
  return file
}
