import {Check} from "lucide-react"

import {cn} from "#lib/utils"

/** Photo selection control shared by the grid and album editor. */
export function PhotoCheckbox(props: {
  checked: boolean
  onCheckedChange: (checked: boolean) => void
  label: string
}) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={props.checked}
      aria-label={props.label}
      className={cn(
        "absolute right-1 bottom-1 grid size-6 cursor-pointer place-items-center rounded-md transition-[color,background-color,opacity] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
        props.checked
          ? "bg-primary text-primary-foreground opacity-100"
          : "bg-white/50 text-black/70 opacity-0 group-focus-within/photo:opacity-100 group-hover/photo:opacity-100",
      )}
      onClick={(event) => {
        event.stopPropagation()
        props.onCheckedChange(!props.checked)
      }}
    >
      <Check aria-hidden="true" className="size-4" />
    </button>
  )
}
