import {createFileRoute, useNavigate} from "@tanstack/react-router"
import {LogOut} from "lucide-react"
import {useState} from "react"

import {Header} from "#components/header"
import {Button} from "#components/ui/button"
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldLabel,
  FieldLegend,
  FieldSet,
  FieldTitle,
} from "#components/ui/field"
import {Label} from "#components/ui/label.tsx"
import {Progress} from "#components/ui/progress.tsx"
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

function RouteComponent() {
  const navigate = useNavigate()
  const storage = useQueryStorage()
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [thumbnailQuality, setThumbnailQuality] = useState<Quality>("medium")
  const [backupQuality, setBackupQuality] = useState<Quality>("original")

  async function _onSignOutClick() {
    setIsLoggingOut(true)
    await api.logout()
    $authState.value = AuthState.UNAUTHENTICATED
    await navigate({to: "/login"})
  }

  return (
    <>
      <Header title="Settings" />
      <div className="mx-auto max-w-3xl px-4">
        <div className="flex max-w-lg flex-col">
          <h1 className="mt-8 mb-4 text-2xl font-medium">Storage</h1>
          {storage.data.photo_count} photos <br />
          {storage.data.total_used}b
          <FieldSet>
            <FieldLegend className="data-[variant=label]:text-md/relaxed" variant="label">
              Thumbnail Quality
            </FieldLegend>

            <RadioGroup
              value={thumbnailQuality}
              onValueChange={(val) => setThumbnailQuality(val as Quality)}
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
                <RadioGroupItem value="medium" />
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
          <FieldSet className="mt-8">
            <FieldLegend className="data-[variant=label]:text-md/relaxed" variant="label">
              Backup Quality
            </FieldLegend>

            <RadioGroup
              value={backupQuality}
              onValueChange={(val) => setBackupQuality(val as Quality)}
            >
              <Field orientation="horizontal">
                <RadioGroupItem value="low" />
                <FieldContent>
                  <FieldTitle>Storage Saver</FieldTitle>
                  <FieldDescription>Always compress files to save space</FieldDescription>
                </FieldContent>
              </Field>

              <Field orientation="horizontal">
                <RadioGroupItem value="medium" />
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
          <h1 className="mt-12 mb-4 text-2xl font-medium">Account</h1>
          <Button
            variant="destructive"
            onClick={_onSignOutClick}
            disabled={isLoggingOut}
            className="mr-auto"
          >
            {isLoggingOut ? <Spinner className="h-4 w-4" /> : <LogOut className="h-4 w-4" />}
            Sign Out
          </Button>
        </div>
      </div>
    </>
  )
}

export const Route = createFileRoute("/settings")({component: RouteComponent})
