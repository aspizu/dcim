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
          "transition-opacity duration-300",
          props.className,
        )}
        onLoad={(event) => {
          setTimeout(() => setLoaded(true), 100)
          props.onLoad?.(event)
        }}
      />
    )
  },
)
