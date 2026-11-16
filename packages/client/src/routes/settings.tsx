import {useComputed} from "@preact/signals-react"
import {createFileRoute, useNavigate} from "@tanstack/react-router"
import {LogOut, Moon, Sun, Monitor} from "lucide-react"
import Mustache from "mustache"
import prettyBytes from "pretty-bytes"
import {useState} from "react"

import {Header} from "#components/header"
import {Button} from "#components/ui/button"
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
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
import {Textarea} from "#components/ui/textarea.tsx"
import {useQueryStorage} from "#hooks/queries"
import * as api from "#services/api"
import {$authState, AuthState} from "#stores/auth"
import {
  $backupQuality,
  $htmlImageTemplate,
  $htmlVideoTemplate,
  $thumbnailQuality,
} from "#stores/settings"
import {$themePreference, setThemePreference} from "#stores/themes"

function StorageSection() {
  const storage = useQueryStorage()
  const FLOPPY_BYTES = 1474560
  const DVD_BYTES = 4700000000
  const floppies = Math.ceil(storage.data.total_used / FLOPPY_BYTES)
  const dvds = Math.ceil(storage.data.total_used / DVD_BYTES)
  return (
    <>
      <h1 className="mt-10 mb-1 text-xl font-semibold tracking-tight">Storage</h1>
      <p className="mb-6 text-sm text-muted-foreground">
        {storage.data.photo_count.toLocaleString()} photo
        {storage.data.photo_count != 1 && "s"} &bull; {prettyBytes(storage.data.total_used)}{" "}
        used 💾×{floppies} 📀×{dvds}
      </p>

      <FieldSet>
        <FieldLegend
          className="data-[variant=label]:text-sm data-[variant=label]:font-medium"
          variant="label"
        >
          Thumbnail Quality
        </FieldLegend>

        <RadioGroup
          value={$thumbnailQuality.get()}
          onValueChange={(val) => {
            $thumbnailQuality.set(val)
          }}
        >
          <Field orientation="horizontal">
            <RadioGroupItem value="low" />
            <FieldContent>
              <FieldTitle>Low</FieldTitle>
              <FieldDescription>Highly-compressed low-resolution thumbnails</FieldDescription>
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
          value={$backupQuality.get()}
          onValueChange={(val) => {
            $backupQuality.set(val)
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
    </>
  )
}

function _getMustacheTemplateError(template: string) {
  try {
    Mustache.parse(template)
    return null
  } catch (e) {
    if (!(e instanceof Error)) {
      throw e
    }
    return e.message
  }
}

function AdvancedSection() {
  const $htmlImageTemplateError = useComputed(() =>
    _getMustacheTemplateError($htmlImageTemplate.get()),
  )
  const $htmlVideoTemplateError = useComputed(() =>
    _getMustacheTemplateError($htmlVideoTemplate.get()),
  )
  return (
    <>
      <h1 className="mt-10 mb-6 text-xl font-semibold tracking-tight">Advanced</h1>

      <FieldSet>
        <Field>
          <FieldContent>
            <FieldTitle>Copy Photo as HTML Template</FieldTitle>
            <FieldDescription>
              {"Use the tokens: src, alt, poster, width, height wrapped in {{ and }}"}
            </FieldDescription>
          </FieldContent>
          <Textarea
            className="font-mono"
            value={$htmlImageTemplate.get()}
            onChange={(event) => $htmlImageTemplate.set(event.target.value)}
          />
          {$htmlImageTemplateError.value && (
            <FieldError>{$htmlImageTemplateError.value}</FieldError>
          )}
        </Field>
        <Field>
          <FieldContent>
            <FieldTitle>Copy Video as HTML Template</FieldTitle>
            <FieldDescription>
              {"Use the tokens: src, alt, poster, width, height wrapped in {{ and }}"}
            </FieldDescription>
          </FieldContent>
          <Textarea
            className="font-mono"
            value={$htmlVideoTemplate.get()}
            onChange={(event) => $htmlVideoTemplate.set(event.target.value)}
          />
          {$htmlVideoTemplateError.value && (
            <FieldError>{$htmlVideoTemplateError.value}</FieldError>
          )}
        </Field>
      </FieldSet>
    </>
  )
}

function AppearanceSection() {
  return (
    <>
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
    </>
  )
}

function AccountSection() {
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
    </>
  )
}

function RouteComponent() {
  return (
    <>
      <Header>
        <Header.Before />
        <Header.Title>Settings</Header.Title>
        <Header.After />
      </Header>
      <div className="mx-auto mb-16 max-w-3xl px-4">
        <div className="flex max-w-lg flex-col">
          <StorageSection />
          <AdvancedSection />
          <AppearanceSection />
          <AccountSection />
        </div>
      </div>
    </>
  )
}

export const Route = createFileRoute("/settings")({component: RouteComponent})
