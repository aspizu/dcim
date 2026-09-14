import {forwardRef, useState, type ComponentPropsWithoutRef} from "react"

import {cn} from "#lib/utils"

export const ImgFaded = forwardRef<HTMLImageElement, ComponentPropsWithoutRef<"img">>(
  (props, ref) => {
    const [state, setState] = useState({key: props.src, loaded: false})
    const loaded = state.key === props.src && state.loaded
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
          setTimeout(() => setState({key: props.src, loaded: true}), 50)
          props.onLoad?.(event)
        }}
      />
    )
  },
)
