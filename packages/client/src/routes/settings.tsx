import {createFileRoute, useNavigate} from "@tanstack/react-router"
import {LogOut} from "lucide-react"
import {useState} from "react"

import {Header} from "#components/header"
import {Button} from "#components/ui/button"
import {Spinner} from "#components/ui/spinner"
import * as api from "#services/api"
import {$authState, AuthState} from "#stores/auth"

const qualityOptions = ["low", "medium", "high", "original"] as const

function RouteComponent() {
  const navigate = useNavigate()
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [thumbnailQuality, setThumbnailQuality] = useState("medium")
  const [backupQuality, setBackupQuality] = useState("original")
  async function _onSignOutClick() {
    setIsLoggingOut(true)
    await api.logout()
    $authState.value = AuthState.UNAUTHENTICATED
    await navigate({to: "/login"})
  }
  return (
    <>
      <Header title="Settings" />
      <div className="flex flex-col items-start gap-6 p-4">
        <label className="flex items-center gap-2">
          <span className="text-sm">Thumbnail quality</span>
          <select
            className="rounded-md border px-2 py-1 text-sm"
            value={thumbnailQuality}
            onChange={(e) => setThumbnailQuality(e.target.value)}
          >
            {qualityOptions.map((q) => (
              <option key={q} value={q}>
                {q}
              </option>
            ))}
          </select>
        </label>
        <label className="flex items-center gap-2">
          <span className="text-sm">Backup quality</span>
          <select
            className="rounded-md border px-2 py-1 text-sm"
            value={backupQuality}
            onChange={(e) => setBackupQuality(e.target.value)}
          >
            {qualityOptions.map((q) => (
              <option key={q} value={q}>
                {q}
              </option>
            ))}
          </select>
        </label>
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
