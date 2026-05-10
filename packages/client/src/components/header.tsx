import * as api from "#services/api"
import {$authState, AuthState} from "#stores/auth"
import {Link, useNavigate} from "@tanstack/react-router"
import {Ellipsis, LogOut, Settings} from "lucide-react"
import {useState, type ReactNode} from "react"
import {Button} from "./ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu"
import {Spinner} from "./ui/spinner"

function UserDropDown() {
  const navigate = useNavigate()
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  async function onSignOutClick() {
    setIsLoggingOut(true)
    await api.logout()
    $authState.value = AuthState.UNAUTHENTICATED
    await navigate({to: "/login"})
  }
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
          <DropdownMenuItem
            variant="destructive"
            onClick={() => void onSignOutClick()}
            disabled={isLoggingOut}
          >
            {isLoggingOut ?
              <Spinner />
            : <LogOut />}
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
