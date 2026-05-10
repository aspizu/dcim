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

export function getImageDimensions(file: File): Promise<{width: number; height: number}> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      resolve({width: img.naturalWidth, height: img.naturalHeight})
      URL.revokeObjectURL(url)
    }
    img.onerror = () => {
      reject(new Error("Failed to load image dimensions"))
      URL.revokeObjectURL(url)
    }
    img.src = url
  })
}
