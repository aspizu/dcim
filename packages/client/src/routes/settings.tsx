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
      <div className="mx-auto flex max-w-lg flex-col gap-4 p-4">
        <div className="rounded-lg border p-4">
          <h2 className="mb-2 text-lg font-medium">Session</h2>
          <p className="mb-4 text-sm text-muted-foreground">
            You are logged in. Sign out to end your session.
          </p>
          <Button
            variant="destructive"
            onClick={() => void _onSignOutClick()}
            disabled={isLoggingOut}
          >
            {isLoggingOut ? <Spinner /> : <LogOut />}
            Sign out
          </Button>
        </div>
      </div>
    </>
  )
}

export const Route = createFileRoute("/settings")({component: RouteComponent})
