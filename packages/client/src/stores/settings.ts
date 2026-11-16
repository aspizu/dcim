import * as CFG from "#lib/config"

export const DEFAULT_HTML_IMAGE_TEMPLATE =
  '<img src="{{src}}" alt="{{alt}}" width="{{width}}" height="{{height}}" loading="lazy" />'
export const DEFAULT_HTML_VIDEO_TEMPLATE =
  '<video src="{{src}}" poster="{{poster}}" aria-label="{{alt}}" width="{{width}}" height="{{height}}" controls autoplay muted playsinline></video>'

export const $thumbnailQuality = new CFG.Option("thumbnailQuality", "balanced")
export const $backupQuality = new CFG.Option("backupQuality", "original")
export const $htmlImageTemplate = new CFG.Option(
  "htmlImageTemplate",
  DEFAULT_HTML_IMAGE_TEMPLATE,
)
export const $htmlVideoTemplate = new CFG.Option(
  "htmlVideoTemplate",
  DEFAULT_HTML_VIDEO_TEMPLATE,
)

export function pullConfig() {
  return CFG.pullConfig({
    thumbnailQuality: $thumbnailQuality,
    backupQuality: $backupQuality,
    htmlImageTemplate: $htmlImageTemplate,
    htmlVideoTemplate: $htmlVideoTemplate,
  })
}
