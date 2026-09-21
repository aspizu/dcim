import {useSignal} from "@preact/signals-react"
import {useQuery} from "@tanstack/react-query"
import {Link, useNavigate} from "@tanstack/react-router"
import {ArrowLeft, ArrowRight} from "lucide-react"
import {useLayoutEffect, useRef, type ComponentProps, type PointerEvent} from "react"

import {Photo} from "#components/photo"
import {Button} from "#components/ui/button"
import {queryAlbumPhotoOptions, queryPhotoOptions} from "#hooks/queries"
import {cn} from "#lib/utils"

type PhotoProps = ComponentProps<typeof Photo>

function PhotoSlide(props: {id: string; viewer: PhotoProps; position: number}) {
  const photo = useQuery(
    props.viewer.album
      ? queryAlbumPhotoOptions(props.viewer.album.id, props.id)
      : queryPhotoOptions(props.id),
  )
  const active = props.position === 0
  const data = active ? props.viewer.photo : photo.data
  if (!data) {
    return null
  }
  return (
    <div
      className={cn(
        "absolute inset-0 flex",
        props.position === -1 && "-translate-x-full",
        props.position === 1 && "translate-x-full",
      )}
      inert={!active}
      aria-hidden={!active}
    >
      <Photo
        {...props.viewer}
        photo={data}
        captionEditable={active && props.viewer.captionEditable}
        preview={!active || props.viewer.preview}
      />
    </div>
  )
}

export function PhotoStrip(props: PhotoProps) {
  const navigate = useNavigate()
  const drag = useSignal<{pointerId: number; startX: number; startY: number} | null>(null)
  const offset = useSignal(0)
  const settling = useRef(false)
  const track = useRef<HTMLDivElement>(null)
  const suppressClick = useRef(false)
  const samples = useRef<{x: number; time: number}[]>([])
  useLayoutEffect(() => {
    for (const animation of track.current?.getAnimations() ?? []) {
      animation.cancel()
    }
    drag.value = null
    offset.value = 0
    settling.current = false
  }, [props.photo.id, drag, offset, settling])
  async function _onPointerEnd(event: PointerEvent<HTMLDivElement>) {
    if (drag.value?.pointerId !== event.pointerId) return
    drag.value = null
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }
    if (!track.current || offset.value === 0) return
    const width = event.currentTarget.clientWidth
    const recent = samples.current.find((sample) => event.timeStamp - sample.time <= 100)
    const elapsed = recent ? event.timeStamp - recent.time : 0
    const distance = recent ? event.clientX - recent.x : 0
    const velocity = elapsed > 0 ? distance / elapsed : 0
    const flick = Math.abs(velocity) >= 0.5 && Math.abs(distance) >= 8
    const direction = flick ? velocity : offset.value
    const target = direction > 0 ? props.photo.prev : props.photo.next
    const shouldNavigate =
      event.type === "pointerup" && target && (flick || Math.abs(offset.value) >= width * 0.25)
    settling.current = true
    const destination = shouldNavigate ? (direction > 0 ? width : -width) : 0
    const animation = track.current.animate(
      [
        {transform: `translateX(${offset.value}px)`},
        {transform: `translateX(${destination}px)`},
      ],
      {
        duration: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 200,
        easing: "ease-out",
        fill: "forwards",
      },
    )
    try {
      await animation.finished
      if (!shouldNavigate) return
      await navigate({
        to: props.album ? "/a/$album/p/$photo" : "/p/$photo",
        params: props.album ? {album: props.album.id, photo: target} : {photo: target},
        replace: true,
        viewTransition: false,
      })
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return
      console.error(error)
    } finally {
      animation.cancel()
      offset.value = 0
      settling.current = false
    }
  }
  return (
    <div
      className={cn(
        "relative min-h-0 grow overflow-hidden",
        !props.captionEditable && "touch-pan-y touch-pinch-zoom select-none",
        !props.captionEditable && (drag.value ? "cursor-grabbing" : "cursor-grab"),
      )}
      onPointerDown={(event) => {
        suppressClick.current = false
        if (
          !event.isPrimary ||
          event.button !== 0 ||
          props.captionEditable ||
          drag.value ||
          settling.current
        )
          return
        if (
          event.target instanceof Element &&
          event.target.closest("a, button, input, textarea, select, [contenteditable]")
        )
          return
        document.activeViewTransition?.skipTransition()
        samples.current = [{x: event.clientX, time: event.timeStamp}]
        drag.value = {pointerId: event.pointerId, startX: event.clientX, startY: event.clientY}
      }}
      onPointerMove={(event) => {
        if (drag.value?.pointerId !== event.pointerId) return
        samples.current = [
          ...samples.current.filter((sample) => event.timeStamp - sample.time <= 100),
          {x: event.clientX, time: event.timeStamp},
        ]
        const distance = event.clientX - drag.value.startX
        if (!event.currentTarget.hasPointerCapture(event.pointerId)) {
          if (Math.abs(distance) <= 5) return
          if (Math.abs(event.clientY - drag.value.startY) >= Math.abs(distance)) {
            drag.value = null
            return
          }
          event.currentTarget.setPointerCapture(event.pointerId)
          suppressClick.current = true
        }
        const width = event.currentTarget.clientWidth
        const bounded = Math.max(-width, Math.min(width, distance))
        const atEdge =
          (distance > 0 && !props.photo.prev) || (distance < 0 && !props.photo.next)
        offset.value = atEdge ? bounded * 0.2 : bounded
      }}
      onPointerUp={(event) => {
        void _onPointerEnd(event)
      }}
      onPointerCancel={(event) => {
        void _onPointerEnd(event)
      }}
      onLostPointerCapture={(event) => {
        if (event.target !== event.currentTarget) return
        void _onPointerEnd(event)
      }}
      onPointerLeave={(event) => {
        if (event.currentTarget.hasPointerCapture(event.pointerId)) return
        void _onPointerEnd(event)
      }}
      onClickCapture={(event) => {
        if (!suppressClick.current || event.detail === 0) return
        event.preventDefault()
        event.stopPropagation()
        suppressClick.current = false
      }}
      onDragStart={(event) => {
        event.preventDefault()
      }}
    >
      <div
        ref={track}
        className="absolute inset-0"
        style={{transform: `translateX(${offset.value}px)`}}
      >
        {[props.photo.prev, props.photo.id, props.photo.next].map((id, index) =>
          id ? <PhotoSlide key={id} id={id} viewer={props} position={index - 1} /> : null,
        )}
      </div>
      <div
        className={cn(
          "pointer-events-none absolute inset-0 mb-12 transition-opacity duration-150 motion-reduce:transition-none",
          drag.value ? "opacity-0" : "opacity-100 [&_a]:pointer-events-auto",
        )}
        inert={drag.value !== null}
      >
        {!props.preview &&
          [props.photo.prev, props.photo.next].map((id, index) =>
            id ? (
              <Button
                key={id}
                className={cn(
                  "absolute top-[50%] translate-y-[-50%]",
                  index === 0 ? "left-4" : "right-4",
                )}
                variant="secondary"
                size="icon-sm"
                asChild
              >
                <Link
                  to={props.album ? "/a/$album/p/$photo" : "/p/$photo"}
                  params={props.album ? {album: props.album.id, photo: id} : {photo: id}}
                  viewTransition={false}
                  replace
                >
                  {index === 0 ? <ArrowLeft /> : <ArrowRight />}
                </Link>
              </Button>
            ) : null,
          )}
      </div>
    </div>
  )
}
