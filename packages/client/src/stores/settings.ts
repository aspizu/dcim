import {signal} from "@preact/signals-react"

import {getConfig, setConfig} from "#lib/config"

function _loadThumbnailQuality(): string {
  return getConfig("thumbnailQuality") ?? "balanced"
}

function _loadBackupQuality(): string {
  return getConfig("backupQuality") ?? "original"
}

export const $thumbnailQuality = signal<string>(_loadThumbnailQuality())
export const $backupQuality = signal<string>(_loadBackupQuality())

$thumbnailQuality.subscribe((val) => {
  void setConfig("thumbnailQuality", val)
})

$backupQuality.subscribe((val) => {
  void setConfig("backupQuality", val)
})
