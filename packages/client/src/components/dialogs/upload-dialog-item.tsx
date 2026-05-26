import {Ellipsis} from "lucide-react"
import prettyBytes from "pretty-bytes"

import {useObjectURL} from "#hooks/object-url"
import {useAsync} from "#hooks/promises"
import {cn} from "#lib/utils"
import {createThumbnail} from "#lib/workers/thumbnail-client"

import {Button} from "../ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu"
import {Progress} from "../ui/progress"

export interface UploadItemProgress {
  percent: number
  failed: boolean
}

interface UploadItem {
  id: string
  handle: FileSystemFileHandle
}

function UploadItemDropDown(props: {id: string; onRemove: (id: string) => void}) {
  function _onRemoveClick() {
    props.onRemove(props.id)
  }
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <Ellipsis />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuGroup>
          <DropdownMenuItem variant="destructive" onClick={_onRemoveClick}>
            Remove
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export function UploadDialogItem(
  props: UploadItem & {
    progress: UploadItemProgress | null
    onRemove: (id: string) => void
  },
) {
  const params = useAsync(async () => {
    const file = await props.handle.getFile()
    return {
      original_size: file.size,
    }
  }, [props.handle])
  const thumbnail = useAsync(async () => {
    return await createThumbnail(props.handle, 128)
  }, [props.handle])
  const thumbnailURL = useObjectURL(
    thumbnail.value?.buffer ?? null,
    thumbnail.value?.type ?? "image/png",
  )
  return (
    <div
      className={cn(
        "flex items-center gap-2 transition-opacity",
        props.progress != null && props.progress.percent >= 99 && "opacity-75",
      )}
      id={`upload-item-${props.id}`}
    >
      {thumbnailURL ? (
        <img src={thumbnailURL} alt="" className="h-16 w-16 shrink-0 rounded-md object-cover" />
      ) : (
        <div className="h-16 w-16 shrink-0 animate-pulse rounded-md bg-neutral-500" />
      )}

      <div className="flex min-w-0 grow flex-col gap-2">
        <div className="flex items-center gap-2">
          <span className="min-w-0 truncate font-medium">{props.handle.name}</span>

          <div className="grow" />

          {params.value && (
            <span className="shrink-0 font-medium text-muted-foreground">
              {prettyBytes(params.value.original_size)}
            </span>
          )}

          {props.progress === null && (
            <UploadItemDropDown id={props.id} onRemove={props.onRemove} />
          )}
        </div>

        {props.progress !== null && (
          <Progress
            value={props.progress.percent}
            className={cn(
              props.progress.failed && "*:data-[slot=progress-indicator]:bg-destructive",
            )}
          />
        )}
        {props.progress?.failed && (
          <span className="text-xs font-medium text-destructive">Upload failed</span>
        )}
      </div>
    </div>
  )
}
