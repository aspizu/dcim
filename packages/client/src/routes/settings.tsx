import {createFileRoute, useNavigate} from "@tanstack/react-router"
import {LogOut, Moon, Sun, Monitor} from "lucide-react"
import prettyBytes from "pretty-bytes"
import {useState} from "react"

import {Header} from "#components/header"
import {Button} from "#components/ui/button"
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldLegend,
  FieldSet,
  FieldTitle,
} from "#components/ui/field"
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
import {$backupQuality, $thumbnailQuality} from "#stores/settings"
import {$themePreference, setThemePreference} from "#stores/themes"

const FLOPPY_BYTES = 1474560
const DVD_BYTES = 4700000000

function StorageUsed(props: {bytes: number}) {
  const floppies = Math.ceil(props.bytes / FLOPPY_BYTES)
  const dvds = Math.ceil(props.bytes / DVD_BYTES)

  return (
    <>
      {prettyBytes(props.bytes)} used 💾×{floppies} 📀×{dvds}
    </>
  )
}

function RouteComponent() {
  const navigate = useNavigate()
  const storage = useQueryStorage()
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
      <div className="mx-auto mb-16 max-w-3xl px-4">
        <div className="flex max-w-lg flex-col">
          <h1 className="mt-10 mb-1 text-xl font-semibold tracking-tight">Storage</h1>
          <p className="mb-6 text-sm text-muted-foreground">
            {storage.data.photo_count.toLocaleString()} photo
            {storage.data.photo_count != 1 && "s"} &bull;{" "}
            <StorageUsed bytes={storage.data.total_used} />
          </p>

          <FieldSet>
            <FieldLegend
              className="data-[variant=label]:text-sm data-[variant=label]:font-medium"
              variant="label"
            >
              Thumbnail Quality
            </FieldLegend>

            <RadioGroup
              value={$thumbnailQuality.value}
              onValueChange={(val) => {
                $thumbnailQuality.value = val
              }}
            >
              <Field orientation="horizontal">
                <RadioGroupItem value="low" />
                <FieldContent>
                  <FieldTitle>Low</FieldTitle>
                  <FieldDescription>
                    Highly-compressed low-resolution thumbnails
                  </FieldDescription>
                </FieldContent>
              </Field>

              <Field orientation="horizontal">
                <RadioGroupItem value="balanced" />
                <FieldContent>
                  <FieldTitle>Balanced</FieldTitle>
                  <FieldDescription>Standard-resolution compressed thumbnails</FieldDescription>
                </FieldContent>
              </Field>

              <Field orientation="horizontal">
                <RadioGroupItem value="high" />
                <FieldContent>
                  <FieldTitle>High</FieldTitle>
                  <FieldDescription>High-resolution compressed thumbnails</FieldDescription>
                </FieldContent>
              </Field>
            </RadioGroup>
          </FieldSet>

          <FieldSet className="mt-6">
            <FieldLegend
              className="data-[variant=label]:text-sm data-[variant=label]:font-medium"
              variant="label"
            >
              Backup Quality
            </FieldLegend>

            <RadioGroup
              value={$backupQuality.value}
              onValueChange={(val) => {
                $backupQuality.value = val
              }}
            >
              <Field orientation="horizontal">
                <RadioGroupItem value="storageSaver" />
                <FieldContent>
                  <FieldTitle>Storage Saver</FieldTitle>
                  <FieldDescription>Always compress files to save space</FieldDescription>
                </FieldContent>
              </Field>

              <Field orientation="horizontal">
                <RadioGroupItem value="smart" />
                <FieldContent>
                  <FieldTitle>Smart</FieldTitle>
                  <FieldDescription>Compress files when ideal</FieldDescription>
                </FieldContent>
              </Field>

              <Field orientation="horizontal">
                <RadioGroupItem value="original" />
                <FieldContent>
                  <FieldTitle>Original</FieldTitle>
                  <FieldDescription>Store original files as-is</FieldDescription>
                </FieldContent>
              </Field>
            </RadioGroup>
          </FieldSet>

          <h1 className="mt-10 mb-6 text-xl font-semibold tracking-tight">Appearance</h1>

          <FieldSet>
            <Field orientation="horizontal">
              <FieldContent>
                <FieldTitle>Theme</FieldTitle>
                <FieldDescription>Choose your preferred appearance</FieldDescription>
              </FieldContent>
              <Select
                value={$themePreference.value}
                onValueChange={(val) => {
                  setThemePreference(val as "light" | "dark" | "system")
                }}
              >
                <SelectTrigger className="w-36">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="system">
                      <Monitor className="size-3.5" />
                      System
                    </SelectItem>
                    <SelectItem value="light">
                      <Sun className="size-3.5" />
                      Light
                    </SelectItem>
                    <SelectItem value="dark">
                      <Moon className="size-3.5" />
                      Dark
                    </SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </Field>
          </FieldSet>

          <h1 className="mt-10 mb-6 text-xl font-semibold tracking-tight">Account</h1>

          <Button
            variant="destructive"
            onClick={() => void _onSignOutClick()}
            disabled={isLoggingOut}
            className="mr-auto"
          >
            {isLoggingOut ? <Spinner /> : <LogOut />}
            Sign Out
          </Button>
        </div>
      </div>
    </>
  )
}

export const Route = createFileRoute("/settings")({component: RouteComponent})
