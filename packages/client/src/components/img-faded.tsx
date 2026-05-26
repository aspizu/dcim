import {forwardRef, useEffect, useState, type ComponentPropsWithoutRef} from "react"

import {cn} from "#lib/utils"

export const ImgFaded = forwardRef<HTMLImageElement, ComponentPropsWithoutRef<"img">>(
  (props, ref) => {
    const [loaded, setLoaded] = useState(false)
    useEffect(() => {
      setLoaded(false)
    }, [props.src])
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
