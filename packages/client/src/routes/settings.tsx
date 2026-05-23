import {createFileRoute, useNavigate} from "@tanstack/react-router"
import {LogOut} from "lucide-react"
import {useState} from "react"

import {Header} from "#components/header"
import {Button} from "#components/ui/button"
import {Spinner} from "#components/ui/spinner"
import * as api from "#services/api"
import {$authState, AuthState} from "#stores/auth"

function RouteComponent() {
  const navigate = useNavigate()
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  async function _onSignOutClick() {
    setIsLoggingOut(true)
    await api.logout()
    $authState.value = AuthState.UNAUTHENTICATED
    await navigate({to: "/login"})
  }
  return (
    <>
      <Header title="Settings" />
      <div className="flex flex-col items-start gap-4 p-4">
        <Button
          variant="destructive"
          onClick={() => void _onSignOutClick()}
          disabled={isLoggingOut}
        >
          {isLoggingOut ? <Spinner /> : <LogOut />}
          Sign out
        </Button>
      </div>
    </>
  )
}

export const Route = createFileRoute("/settings")({component: RouteComponent})
