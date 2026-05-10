import {Link} from "@tanstack/react-router"
import {Ellipsis, LogOut, Settings} from "lucide-react"
import type {ReactNode} from "react"
import {Button} from "./ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu"

function UserDropDown() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <Ellipsis />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <Link to="/settings">
              <Settings />
              Settings
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem variant="destructive">
            <LogOut />
            Sign out
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export interface HeaderProps {
  title: string
  before?: ReactNode
}

export function Header(props: HeaderProps) {
  return (
    <div className="sticky top-0 z-10 grid grid-cols-3 bg-white/85 p-2 backdrop-blur">
      <div className="self-center">{props.before}</div>
      <div className="self-center justify-self-center">
        <h1 className="font-medium">{props.title}</h1>
      </div>
      <div className="self-center justify-self-end">
        <UserDropDown />
      </div>
    </div>
  )
}
