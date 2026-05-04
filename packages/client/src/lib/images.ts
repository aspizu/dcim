export function loadImage(file: File) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image()
    const url = URL.createObjectURL(file)

    image.onload = () => {
      URL.revokeObjectURL(url)
      resolve(image)
    }

    image.onerror = (err) => {
      URL.revokeObjectURL(url)
      reject(err)
    }

    image.src = url
  })
}

export async function createThumbnail(blob: Blob) {
  const arrayBuffer = await blob.arrayBuffer()
  const hashBuffer = await crypto.subtle.digest("SHA-256", arrayBuffer)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  const sha256 = btoa(String.fromCharCode(...hashArray))
  return {blob, size: blob.size, sha256}
}
