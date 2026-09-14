import {useSignal} from "@preact/signals-react"

import {cn} from "#lib/utils"

export function VideoPlayer(props: {src: string; label: string}) {
  const state = useSignal({key: props.src, loaded: false})
  const loaded = state.value.key === props.src && state.value.loaded
  return (
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
        loaded ? "opacity-100" : "opacity-0",
      )}
      onLoadedData={() => {
        state.value = {key: props.src, loaded: true}
      }}
      onCanPlay={() => {
        state.value = {key: props.src, loaded: true}
      }}
    />
  )
}
