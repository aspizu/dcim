export async function loadImage(source: Blob | FileSystemFileHandle): Promise<ImageBitmap> {
  const blob = source instanceof FileSystemFileHandle ? await source.getFile() : source

  return await createImageBitmap(blob)
}
