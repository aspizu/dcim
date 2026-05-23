import {createFileRoute, useNavigate} from "@tanstack/react-router"
import {LogOut} from "lucide-react"
import {useState} from "react"

import {Header} from "#components/header"
import {Button} from "#components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "#components/ui/select"
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
          <Select value={thumbnailQuality} onValueChange={setThumbnailQuality}>
            <SelectTrigger className="w-28">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {qualityOptions.map((q) => (
                <SelectItem key={q} value={q}>
                  {q}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </label>
        <label className="flex items-center gap-2">
          <span className="text-sm">Backup quality</span>
          <Select value={backupQuality} onValueChange={setBackupQuality}>
            <SelectTrigger className="w-28">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {qualityOptions.map((q) => (
                <SelectItem key={q} value={q}>
                  {q}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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
