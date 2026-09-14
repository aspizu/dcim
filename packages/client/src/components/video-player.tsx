import {useSignal} from "@preact/signals-react"
import {CircleAlert} from "lucide-react"

import {cn} from "#lib/utils"

export function VideoPlayer(props: {src: string; label: string}) {
  const state = useSignal({key: props.src, loaded: false, failed: false})
  const loaded = state.value.key === props.src && state.value.loaded
  const failed = state.value.key === props.src && state.value.failed
  return (
    <>
      <video
        src={props.src}
        aria-label={props.label}
        controls
        autoPlay
        muted
        playsInline
        preload="auto"
        className={cn(
          "absolute inset-0 h-full w-full transition-opacity duration-300",
          loaded ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        tabIndex={loaded ? 0 : -1}
        onLoadedData={() => {
          state.value = {key: props.src, loaded: true, failed: false}
        }}
        onCanPlay={() => {
          state.value = {key: props.src, loaded: true, failed: false}
        }}
        onError={() => {
          state.value = {key: props.src, loaded: false, failed: true}
        }}
      />
      {failed && (
        <div
          className="pointer-events-none absolute inset-0 grid place-items-center bg-black/40 text-white"
          role="status"
        >
          <CircleAlert className="size-10" aria-hidden="true" />
          <span className="sr-only">Video failed to load</span>
        </div>
      )}
    </>
  )
}
