import axios from "axios"

import * as api from "#services/api"
import {ApiError, NetworkError} from "#services/fetch"

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
  onUploadProgress: (id: string, state: {percent: number; failed: boolean}) => void,
) {
  let lastPercent = 0
  try {
    const uploaded = await api.createPhoto(prepared.upload)

    const res1 = await axios.put(uploaded.imagePresignedURL, prepared.image, {
      headers: {
        "Content-Type": prepared.upload.image.contentType,
        "x-amz-checksum-sha256": prepared.upload.image.contentSHA256,
        "Cache-Control": "public, max-age=31536000, immutable, no-transform",
        "Content-Disposition": `attachment; filename=${JSON.stringify(prepared.upload.fileName)}`,
      },
      onUploadProgress(e) {
        lastPercent = (e.loaded / e.total!) * 75
        onUploadProgress(clientId, {percent: lastPercent, failed: false})
      },
    })
    if (res1.status !== 200) {
      onUploadProgress(clientId, {percent: lastPercent, failed: true})
      return
    }

    lastPercent = 75
    const res2 = await axios.put(uploaded.thumbnailPresignedURL, prepared.thumbnail, {
      headers: {
        "Content-Type": prepared.upload.thumbnail.contentType,
        "x-amz-checksum-sha256": prepared.upload.thumbnail.contentSHA256,
        "Cache-Control": "public, max-age=31536000, immutable, no-transform",
      },
      onUploadProgress(e) {
        lastPercent = 75 + (e.loaded / e.total!) * 25
        onUploadProgress(clientId, {percent: lastPercent, failed: false})
      },
    })
    if (res2.status !== 200) {
      onUploadProgress(clientId, {percent: lastPercent, failed: true})
      return
    }

    await api.confirmPhotoUploaded({id: uploaded.id})
    return uploaded.id
  } catch (e) {
    if (!(e instanceof ApiError || e instanceof NetworkError || axios.isAxiosError(e))) {
      throw e
    }
    onUploadProgress(clientId, {percent: lastPercent, failed: true})
  }
}
