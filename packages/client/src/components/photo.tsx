import {Link} from "@tanstack/react-router"
import {useWindowSize} from "@uidotdev/usehooks"
import _ from "lodash"
import {ArrowLeft, ArrowRight, Check} from "lucide-react"
import {useCallback, useEffect, useRef, useState} from "react"

import {ImgFaded} from "#components/img-faded"
import {Button} from "#components/ui/button"
import {useUpdatePhotoCaption} from "#hooks/mutations"
import {cn} from "#lib/utils"
import type * as api from "#services/api"

interface CaptionParams {
  content: string
  y: number
}

function _calcDimensions(
  photoW: number,
  photoH: number,
  windowW: number | null,
  windowH: number | null,
) {
  if (!windowW || !windowH) {
    return {w: null, h: null}
  }
  const aspect = photoW / photoH
  const maxW = windowW
  const maxH = windowH - 88
  if (maxW / maxH > aspect) {
    return {w: maxH * aspect, h: maxH}
  }
  return {w: maxW, h: maxW / aspect}
}

function PhotoCaption(props: {
  photoId: string
  caption: string | null
  editable: boolean
  onSetEditable: (value: boolean) => void
}) {
  const captionParams: CaptionParams = props.caption ? JSON.parse(props.caption) : null
  const [text, setText] = useState(captionParams?.content ?? "")
  const [position, setPosition] = useState(captionParams?.y ?? 0.9)
  const [mouseY, setMouseY] = useState<number | null>(null)
  const updateCaption = useUpdatePhotoCaption()

  const ref = useRef<HTMLDivElement>(null)

  function _onDragStart(clientY: number) {
    const parent = ref.current?.parentElement
    if (!parent) return
    const parentRect = parent.getBoundingClientRect()
    setMouseY(position - (clientY - parentRect.top) / parentRect.height)
  }

  const onDragMove = useCallback(
    (clientY: number) => {
      if (mouseY === null) return
      if (!props.editable) return
      const parent = ref.current?.parentElement
      if (!parent) return
      const parentRect = parent.getBoundingClientRect()
      setPosition(_.clamp(mouseY + (clientY - parentRect.top) / parentRect.height, 0.1, 0.9))
    },
    [mouseY, props.editable],
  )

  const onDragEnd = useCallback(() => {
    setMouseY(null)
  }, [])

  useEffect(() => {
    function _onMouseMove(e: MouseEvent) {
      if (e.buttons != 1) return
      onDragMove(e.clientY)
    }
    window.addEventListener("mousemove", _onMouseMove)
    window.addEventListener("mouseup", onDragEnd)
    return () => {
      window.removeEventListener("mousemove", _onMouseMove)
      window.removeEventListener("mouseup", onDragEnd)
    }
  }, [onDragMove, onDragEnd, props.editable])

  return (
    <>
      <div
        ref={ref}
        className={cn(
          "absolute inset-x-0 translate-y-[-50%] bg-black/35 transition-opacity",
          (!props.editable || mouseY !== null) && "select-none",
          !props.editable && captionParams === null && "pointer-events-none opacity-0",
        )}
        style={{
          top: `${position * 100}%`,
        }}
        onTouchStart={(e) => {
          const touch = e.touches[0]
          if (!touch) return
          _onDragStart(touch.clientY)
        }}
        onTouchEnd={onDragEnd}
        onTouchMove={(e) => {
          const touch = e.touches[0]
          if (!touch) return
          onDragMove(touch.clientY)
        }}
        onMouseDown={(e) => {
          _onDragStart(e.clientY)
        }}
      >
        <input
          className={cn(
            "w-full border-b border-b-transparent text-center text-lg font-medium transition-colors text-shadow-sm focus:border-b-white focus:outline-0",
            (!props.editable || mouseY !== null) && "pointer-events-none",
          )}
          readOnly={!props.editable || mouseY !== null}
          value={text ?? ""}
          onChange={(e) => {
            setText(e.target.value)
          }}
        />
      </div>
      {props.editable && (
        <Button
          className="absolute right-2 bottom-2"
          size="icon-lg"
          onClick={() => {
            updateCaption.mutate({
              id: props.photoId,
              caption: text.trim() ? JSON.stringify({content: text.trim(), y: position}) : null,
            })
            props.onSetEditable(false)
          }}
        >
          <Check />
        </Button>
      )}
    </>
  )
}

export function Photo(props: {
  photo: api.Photo & {prev: string | null; next: string | null}
  album?: api.Album
  captionEditable: boolean
  setCaptionEditable: (value: boolean) => void
}) {
  const windowSize = useWindowSize()
  const {w, h} = _calcDimensions(
    props.photo.width,
    props.photo.height,
    windowSize.width,
    windowSize.height,
  )
  return (
    <div className="relative mb-11 grid grow place-items-center">
      <div
        className="relative overflow-hidden"
        style={{
          aspectRatio: `${props.photo.width / props.photo.height}`,
          viewTransitionName: `photo-${props.photo.id}`,
          width: `${w}px`,
          height: `${h}px`,
        }}
      >
        <img
          src={props.photo.thumbhash}
          alt={props.photo.file_name}
          className="absolute inset-0 scale-[1.05] blur-md"
        />
        <ImgFaded
          src={props.photo.thumbnail_url}
          alt={props.photo.file_name}
          className="absolute inset-0 h-full w-full"
        />
        <ImgFaded
          src={props.photo.image_url}
          alt={props.photo.file_name}
          className="absolute inset-0 h-full w-full"
        />
        <PhotoCaption
          photoId={props.photo.id}
          caption={props.photo.caption}
          editable={props.captionEditable}
          onSetEditable={props.setCaptionEditable}
        />
      </div>
      {props.photo.prev && (
        <Button
          className="absolute top-[50%] left-4 translate-y-[-50%]"
          variant="secondary"
          size="icon-lg"
          asChild
        >
          {props.album ? (
            <Link
              to="/a/$album/p/$photo"
              params={{
                album: props.album.id,
                photo: props.photo.prev,
              }}
              replace
            >
              <ArrowLeft />
            </Link>
          ) : (
            <Link to="/p/$photo" params={{photo: props.photo.prev}} replace>
              <ArrowLeft />
            </Link>
          )}
        </Button>
      )}
      {props.photo.next && (
        <Button
          className="absolute top-[50%] right-4 translate-y-[-50%]"
          variant="secondary"
          size="icon-lg"
          asChild
        >
          {props.album ? (
            <Link
              to="/a/$album/p/$photo"
              params={{
                album: props.album.id,
                photo: props.photo.next,
              }}
              replace
            >
              <ArrowRight />
            </Link>
          ) : (
            <Link to="/p/$photo" params={{photo: props.photo.next}} replace>
              <ArrowRight />
            </Link>
          )}
        </Button>
      )}
    </div>
  )
}
