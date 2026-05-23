import {createFileRoute, useNavigate} from "@tanstack/react-router"
import {LogOut} from "lucide-react"
import {useState} from "react"

import {Header} from "#components/header"
import {Button} from "#components/ui/button"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "#components/ui/select"
import {Spinner} from "#components/ui/spinner"
import * as api from "#services/api"
import {$authState, AuthState} from "#stores/auth"
import {$themePreference, setThemePreference} from "#stores/themes"

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
      <div className="mx-auto flex w-full max-w-lg flex-col gap-8 p-4">
        <section className="flex flex-col gap-4">
          <h2 className="text-xs font-medium tracking-wider text-muted-foreground uppercase">
            Quality
          </h2>
          <div className="flex items-center justify-between">
            <span className="text-sm">Thumbnail quality</span>
            <Select value={thumbnailQuality} onValueChange={setThumbnailQuality}>
              <SelectTrigger className="w-28">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {qualityOptions.map((q) => (
                    <SelectItem key={q} value={q}>
                      {q}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm">Backup quality</span>
            <Select value={backupQuality} onValueChange={setBackupQuality}>
              <SelectTrigger className="w-28">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {qualityOptions.map((q) => (
                    <SelectItem key={q} value={q}>
                      {q}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </section>
        <div className="h-px bg-border" />
        <section className="flex flex-col gap-4">
          <h2 className="text-xs font-medium tracking-wider text-muted-foreground uppercase">
            Appearance
          </h2>
          <div className="flex items-center justify-between">
            <span className="text-sm">Theme</span>
            <Select
              value={$themePreference.value}
              onValueChange={(v) => setThemePreference(v as "light" | "dark" | "system")}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Theme" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="light">Light</SelectItem>
                  <SelectItem value="dark">Dark</SelectItem>
                  <SelectItem value="system">System</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </section>
        <div className="h-px bg-border" />
        <Button
          variant="destructive"
          onClick={() => void _onSignOutClick()}
          disabled={isLoggingOut}
          className="self-start"
        >
          {isLoggingOut ? <Spinner /> : <LogOut />}
          Sign out
        </Button>
      </div>
    </>
  )
}

export const Route = createFileRoute("/settings")({component: RouteComponent})
