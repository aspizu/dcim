export async function sha256(file: Blob | ArrayBuffer): Promise<string> {
  const buffer = file instanceof ArrayBuffer ? file : await file.arrayBuffer()
  const hashBuffer = await crypto.subtle.digest("SHA-256", buffer)

  const bytes = new Uint8Array(hashBuffer)
  let binary = ""
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i])
  }

  return btoa(binary)
}
