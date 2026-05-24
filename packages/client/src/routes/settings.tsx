import {createFileRoute, useNavigate} from "@tanstack/react-router"
import {LogOut} from "lucide-react"
import {useState} from "react"

import {Header} from "#components/header"
import {Button} from "#components/ui/button"
import {Field, FieldContent, FieldDescription, FieldLabel} from "#components/ui/field"
import {RadioGroup, RadioGroupItem} from "#components/ui/radio-group"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "#components/ui/select"
import {Spinner} from "#components/ui/spinner"
import {useQueryStorage} from "#hooks/queries"
import * as api from "#services/api"
import {$authState, AuthState} from "#stores/auth"
import {$themePreference, setThemePreference} from "#stores/themes"

type Quality = "low" | "medium" | "high" | "original"

const qualityOptions: {value: Quality; description: string}[] = [
  {value: "low", description: "Smallest file size, lowest quality"},
  {value: "medium", description: "Balanced quality and file size"},
  {value: "high", description: "High quality, larger file size"},
  {value: "original", description: "Full quality, largest file size"},
]

function RouteComponent() {
  const navigate = useNavigate()
  const _storage = useQueryStorage()
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
          <div className="flex flex-col gap-3">
            <span className="text-sm font-medium">Thumbnail quality</span>
            <RadioGroup
              value={thumbnailQuality}
              onValueChange={setThumbnailQuality}
              className="w-fit"
            >
              {qualityOptions.map((q) => (
                <Field key={q.value} orientation="horizontal">
                  <RadioGroupItem value={q.value} id={`thumb-${q.value}`} />
                  <FieldContent>
                    <FieldLabel htmlFor={`thumb-${q.value}`} className="capitalize">
                      {q.value}
                    </FieldLabel>
                    <FieldDescription>{q.description}</FieldDescription>
                  </FieldContent>
                </Field>
              ))}
            </RadioGroup>
          </div>
          <div className="flex flex-col gap-3">
            <span className="text-sm font-medium">Backup quality</span>
            <RadioGroup
              value={backupQuality}
              onValueChange={setBackupQuality}
              className="w-fit"
            >
              {qualityOptions.map((q) => (
                <Field key={q.value} orientation="horizontal">
                  <RadioGroupItem value={q.value} id={`backup-${q.value}`} />
                  <FieldContent>
                    <FieldLabel htmlFor={`backup-${q.value}`} className="capitalize">
                      {q.value}
                    </FieldLabel>
                    <FieldDescription>{q.description}</FieldDescription>
                  </FieldContent>
                </Field>
              ))}
            </RadioGroup>
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
