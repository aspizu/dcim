import {Link, useNavigate} from "@tanstack/react-router"
import {LogIn, LogOut, Settings} from "lucide-react"
import {useState} from "react"

import {DropdownMenuGroup, DropdownMenuItem} from "#components/ui/dropdown-menu"
import {Spinner} from "#components/ui/spinner"
import * as api from "#services/api"
import {$authState, AuthState} from "#stores/auth"

export function UserMenuItems() {
  const navigate = useNavigate()
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  async function _onSignOutClick() {
    setIsLoggingOut(true)
    await api.logout()
    $authState.value = AuthState.UNAUTHENTICATED
    await navigate({to: "/login"})
  }
  return $authState.value === AuthState.AUTHENTICATED ? (
    <DropdownMenuGroup>
      <DropdownMenuItem asChild>
        <Link to="/settings">
          <Settings />
          Settings
        </Link>
      </DropdownMenuItem>
      <DropdownMenuItem
        variant="destructive"
        onClick={() => void _onSignOutClick()}
        disabled={isLoggingOut}
      >
        {isLoggingOut ? <Spinner /> : <LogOut />}
        Sign out
      </DropdownMenuItem>
    </DropdownMenuGroup>
  ) : (
    <DropdownMenuGroup>
      <DropdownMenuItem asChild>
        <Link to="/login" search={{redirect: window.location.pathname}}>
          <LogIn />
          Login
        </Link>
      </DropdownMenuItem>
    </DropdownMenuGroup>
  )
}
