import {forwardRef} from "react"

import {cn} from "#lib/utils"

const HeaderRoot = forwardRef<HTMLDivElement, React.ComponentPropsWithoutRef<"div">>(
  ({className, ...props}, ref) => (
    <div
      ref={ref}
      className={cn(
        "sticky top-0 z-10 grid grid-cols-[1fr_minmax(0,auto)_1fr] bg-background/85 p-2 backdrop-blur",
        className,
      )}
      {...props}
    />
  ),
)
HeaderRoot.displayName = "Header"

const HeaderBefore = forwardRef<HTMLDivElement, React.ComponentPropsWithoutRef<"div">>(
  ({className, ...props}, ref) => (
    <div ref={ref} className={cn("flex self-center", className)} {...props} />
  ),
)
HeaderBefore.displayName = "Header.Before"

const HeaderAfter = forwardRef<HTMLDivElement, React.ComponentPropsWithoutRef<"div">>(
  ({className, ...props}, ref) => (
    <div ref={ref} className={cn("flex self-center justify-self-end", className)} {...props} />
  ),
)
HeaderAfter.displayName = "Header.After"

const HeaderTitle = forwardRef<HTMLHeadingElement, React.ComponentPropsWithoutRef<"h1">>(
  ({className, ...props}, ref) => (
    <h1 ref={ref} className={cn("truncate font-medium", className)} {...props} />
  ),
)
HeaderTitle.displayName = "Header.Title"

export const Header = Object.assign(HeaderRoot, {
  Before: HeaderBefore,
  After: HeaderAfter,
  Title: HeaderTitle,
})
