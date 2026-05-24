import {createFileRoute, useNavigate} from "@tanstack/react-router"
import {LogOut} from "lucide-react"
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
import {Spinner} from "#components/ui/spinner"
import {useQueryStorage} from "#hooks/queries"
import * as api from "#services/api"
import {$authState, AuthState} from "#stores/auth"
import {$backupQuality, $thumbnailQuality} from "#stores/settings"

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
              value={$backupQuality.value}
              onValueChange={(val) => {
                $backupQuality.value = val
              }}
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
