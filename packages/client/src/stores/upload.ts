import {signal} from "@preact/signals-react"

export type UploadItem = {id: string; handle: FileSystemFileHandle}

export const $uploadState = signal<UploadItem[]>([])
export const $uploadDialogOpen = signal(false)
