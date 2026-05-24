import axios from "axios"

import * as api from "#services/api"

import {transform} from "./workers/transformations-client"

export async function prepareFileUpload(handle: FileSystemFileHandle) {
  const {image, thumbnail} = await transform(handle)
  return {
    upload: {
      fileName: handle.name,
      image: {
        contentType: image.type,
        contentSHA256: image.hash,
        contentLength: image.size,
      },
      thumbnail: {
        contentType: thumbnail.type,
        contentSHA256: thumbnail.hash,
        contentLength: thumbnail.arrayBuffer.byteLength,
      },
      thumbhash: thumbnail.thumbhash,
      width: image.width,
      height: image.height,
      metadata: image.metadata,
    },
    image: new Blob([image.arrayBuffer], {type: image.type}),
    thumbnail: new Blob([thumbnail.arrayBuffer], {type: thumbnail.type}),
  }
}

type Prepared = Awaited<ReturnType<typeof prepareFileUpload>>

export async function completeFileUpload(
  prepared: Prepared,
  clientId: string,
  onUploadProgress: (id: string, progress: number) => void,
) {
  const uploaded = await api.createPhoto(prepared.upload)
  const res1 = await axios.put(uploaded.imagePresignedURL, prepared.image, {
    headers: {
      "Content-Type": prepared.upload.image.contentType,
      "x-amz-checksum-sha256": prepared.upload.image.contentSHA256,
      "Cache-Control": "public, max-age=31536000, immutable, no-transform",
      "Content-Disposition": `attachment; filename=${JSON.stringify(prepared.upload.fileName)}`,
    },
    onUploadProgress(e) {
      onUploadProgress(clientId, (e.loaded / e.total!) * 75)
    },
  })
  if (res1.status !== 200) {
    console.error("Failed to upload image", res1.status, res1.data)
    return
  }
  const res2 = await axios.put(uploaded.thumbnailPresignedURL, prepared.thumbnail, {
    headers: {
      "Content-Type": prepared.upload.thumbnail.contentType,
      "x-amz-checksum-sha256": prepared.upload.thumbnail.contentSHA256,
      "Cache-Control": "public, max-age=31536000, immutable, no-transform",
    },
    onUploadProgress(e) {
      onUploadProgress(clientId, 75 + (e.loaded / e.total!) * 25)
    },
  })
  if (res2.status !== 200) {
    console.error("Failed to upload thumbnail", res2.status, res2.data)
    return
  }
  await api.confirmPhotoUploaded({id: uploaded.id})
  return uploaded.id
}
