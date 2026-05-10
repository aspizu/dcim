import {cn} from "#lib/utils"
import {forwardRef, useState, type ComponentPropsWithoutRef} from "react"

export const ImgFaded = forwardRef<HTMLImageElement, ComponentPropsWithoutRef<"img">>(
  (props, ref) => {
    const [loaded, setLoaded] = useState(false)
    return (
      <img
        ref={ref}
        {...props}
        className={cn(
          loaded ? "opacity-100" : "opacity-0",
          "transition-opacity",
          props.className,
        )}
        onLoad={(event) => {
          setLoaded(true)
          props.onLoad?.(event)
        }}
      />
    )
  },
)
