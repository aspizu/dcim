import {motion, useReducedMotion, type HTMLMotionProps} from "framer-motion"
import {forwardRef} from "react"

import {ProgressiveBlur} from "#components/progressive-blur"
import {cn} from "#lib/utils"

const HeaderRoot = forwardRef<
  HTMLDivElement,
  Omit<HTMLMotionProps<"div">, "children"> & {children?: React.ReactNode; collapsed?: boolean}
>(({className, children, collapsed = false, ...props}, ref) => {
  const reducedMotion = useReducedMotion()
  return (
    <div className="h-12 shrink-0">
      <motion.div
        ref={ref}
        initial={false}
        animate={{y: collapsed ? "-100%" : "0%"}}
        transition={{duration: reducedMotion ? 0 : 0.2, ease: "easeInOut"}}
        inert={collapsed}
        aria-hidden={collapsed || undefined}
        className={cn(
          "fixed inset-x-0 top-0 isolate z-10 grid h-12 grid-cols-[1fr_minmax(0,auto)_1fr] p-2",
          className,
        )}
        {...props}
      >
        <ProgressiveBlur />
        {children}
      </motion.div>
    </div>
  )
})
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
    <h1
      ref={ref}
      className={cn(
        "h-8 self-center truncate rounded-lg bg-background px-2 leading-8 font-medium",
        className,
      )}
      {...props}
    />
  ),
)
HeaderTitle.displayName = "Header.Title"

export const Header = Object.assign(HeaderRoot, {
  Before: HeaderBefore,
  After: HeaderAfter,
  Title: HeaderTitle,
})
