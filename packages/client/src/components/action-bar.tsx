import {useSignal} from "@preact/signals-react"
import {AnimatePresence, motion, useReducedMotion, type HTMLMotionProps} from "framer-motion"
import {Download, Trash, X} from "lucide-react"
import {toast} from "sonner"

import {DeletePhotosDialog} from "#components/dialogs/delete-photos-dialog"
import {Button} from "#components/ui/button"
import {cn} from "#lib/utils"
import type {Photo} from "#services/api"
import {$authState, AuthState} from "#stores/auth"
import {clearPhotoSelection, isPhotoSelected, isMultiSelectionMode} from "#stores/photo-grid"

/** Gallery actions for the selected photos, layered over the header. */
export function ActionBar({
  photos,
  galleryKey,
  className,
  ...props
}: HTMLMotionProps<"div"> & {photos: Photo[]; galleryKey: string}) {
  const reducedMotion = useReducedMotion()
  const isDeleteOpen = useSignal(false)
  const selected = photos.filter((photo) => isPhotoSelected(galleryKey, photo.id))
  function _download() {
    for (const photo of selected) {
      const link = document.createElement("a")
      try {
        link.href = photo.image_url
        link.download = photo.file_name
        document.body.append(link)
        link.click()
      } catch (error) {
        console.error(error)
        toast.error(`Failed to download ${photo.file_name}`)
      } finally {
        link.remove()
      }
    }
  }
  return (
    <>
      <AnimatePresence initial={false}>
        {isMultiSelectionMode(galleryKey) && (
          <motion.div
            initial={{y: "-100%"}}
            animate={{y: "0%"}}
            exit={{y: "-100%"}}
            transition={{duration: reducedMotion ? 0 : 0.2, ease: "easeInOut"}}
            className={cn(
              "fixed inset-x-0 top-0 z-20 flex min-h-12 items-center gap-2 bg-background/85 p-2 backdrop-blur",
              className,
            )}
            {...props}
          >
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label="Clear selection"
              onClick={() => {
                clearPhotoSelection(galleryKey)
              }}
            >
              <X aria-hidden="true" />
            </Button>
            <span
              className="min-w-0 flex-1 truncate text-sm font-medium tabular-nums"
              aria-live="polite"
            >
              {selected.length} selected
            </span>
            <div className="flex shrink-0 items-center gap-1">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label="Download"
                disabled={selected.length === 0}
                onClick={_download}
              >
                <Download aria-hidden="true" />
              </Button>
              {$authState.value === AuthState.AUTHENTICATED && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label="Delete"
                  disabled={selected.length === 0}
                  onClick={() => {
                    isDeleteOpen.value = true
                  }}
                >
                  <Trash aria-hidden="true" />
                </Button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <DeletePhotosDialog
        galleryKey={galleryKey}
        photoIDs={selected.map((photo) => photo.id)}
        open={isDeleteOpen.value}
        onOpenChange={(open) => {
          isDeleteOpen.value = open
        }}
      />
    </>
  )
}
