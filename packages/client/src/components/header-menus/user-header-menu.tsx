import {Button} from "#components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "#components/ui/dropdown-menu"
import {Spinner} from "#components/ui/spinner"
import * as api from "#services/api"
import {$authState, AuthState} from "#stores/auth"
import {Link, useNavigate} from "@tanstack/react-router"
import {Ellipsis, LogOut, Settings} from "lucide-react"
import {useState} from "react"

export function UserHeaderMenu() {
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
