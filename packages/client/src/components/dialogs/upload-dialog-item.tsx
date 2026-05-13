import {Ellipsis} from "lucide-react"
import prettyBytes from "pretty-bytes"

import {useObjectURL} from "#hooks/files"
import {useAsync} from "#hooks/promises"
import {cn} from "#lib/utils"
import {transform} from "#lib/workers/transformations-client"
import type {UploadItem} from "#stores/upload"
import {$uploadDialogOpen, $uploadState} from "#stores/upload"

import {ImgFaded} from "../img-faded"
import {Button} from "../ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu"
import {Progress} from "../ui/progress"

function UploadItemDropDown(props: {id: string}) {
  function _onRemoveClick() {
    $uploadState.value = $uploadState.value.filter((item) => item.id !== props.id)
    if ($uploadState.value.length === 0) {
      $uploadDialogOpen.value = false
    }
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

export function UploadDialogItem(props: UploadItem & {progress: number | null}) {
  const params = useAsync(async () => {
    const file = await props.handle.getFile()
    return {
      thumbnail: new Blob(
        [
          await transform(file, {
            resize: {
              width: 250,
              height: 250,
              fit: "scale-down",
              letterbox: false,
            },
            convert: {
              format: "image/avif",
              quality: 0.3,
            },
          }),
        ],
        {type: "image/avif"},
      ),
      original_size: file.size,
    }
  }, [props.handle])
  const objectURL = useObjectURL(params.value?.thumbnail)
  return (
    <div
      className={cn(
        "flex items-center gap-2 transition-opacity",
        props.progress != null && props.progress >= 99 && "opacity-75",
      )}
      id={`upload-item-${props.id}`}
    >
      {objectURL ? (
        <ImgFaded
          src={objectURL}
          alt={props.handle.name}
          className="aspect-square h-16 w-16 shrink-0 rounded-md object-cover"
        />
      ) : (
        <div className="h-16 w-16 shrink-0 rounded-md bg-neutral-500" />
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

          {props.progress === null && <UploadItemDropDown id={props.id} />}
        </div>
        {props.progress !== null && <Progress value={props.progress} />}
      </div>
    </div>
  )
}
