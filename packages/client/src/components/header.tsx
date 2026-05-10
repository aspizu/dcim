import {type ReactNode} from "react"

export interface HeaderProps {
  title: string
  before?: ReactNode
  after?: ReactNode
}

export function Header(props: HeaderProps) {
  return (
    <div className="bg-primary-background/85 sticky top-0 z-10 grid grid-cols-[1fr_auto_1fr] p-2 backdrop-blur">
      <div className="self-center">{props.before}</div>
      <div className="self-center justify-self-center">
        <h1 className="truncate font-medium">{props.title}</h1>
      </div>
      <div className="self-center justify-self-end">{props.after}</div>
    </div>
  )
}
