import {type ReactNode} from "react"

export interface HeaderProps {
  title: string
  before?: ReactNode
  after?: ReactNode
}

export function Header(props: HeaderProps) {
  return (
    <div className="sticky top-0 z-10 grid grid-cols-[1fr_minmax(0,auto)_1fr] bg-background/85 p-2 backdrop-blur">
      <div className="self-center">{props.before}</div>
      <h1 className="truncate font-medium">{props.title}</h1>
      <div className="self-center justify-self-end">{props.after}</div>
    </div>
  )
}
