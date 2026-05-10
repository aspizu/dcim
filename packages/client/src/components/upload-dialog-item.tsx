import {useObjectURL} from "#hooks/files"
import {useAsync} from "#hooks/promises"
import {thumbnailWorkerPool} from "#lib/uploads"
import type {UploadItem} from "#stores/upload"
import {$uploadState} from "#stores/upload"
import {Ellipsis} from "lucide-react"
import prettyBytes from "pretty-bytes"
import {ImgFaded} from "./img-faded"
import {Button} from "./ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu"
import {Progress} from "./ui/progress"
import {$uploadDialogOpen} from "./upload-dialog"

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
  const thumbnail = useAsync(async () => {
    const file = await props.handle.getFile()
    const transformed = await thumbnailWorkerPool.run(file)
    return {transformed, size: file.size}
  }, [props.handle])
  const objectURL = useObjectURL(thumbnail.value?.transformed)
  return (
    <div className="flex items-center gap-2">
      {objectURL ?
        <ImgFaded
          src={objectURL}
          alt={props.handle.name}
          className="aspect-square h-16 w-16 shrink-0 rounded-md object-cover"
        />
      : <div className="h-16 w-16 shrink-0 rounded-md bg-neutral-500" />}

      <div className="flex min-w-0 grow flex-col gap-2">
        <div className="flex items-center gap-2">
          <span className="min-w-0 truncate font-medium">{props.handle.name}</span>

          <div className="grow" />

          {thumbnail.value && (
            <span className="text-muted-foreground shrink-0 font-medium">
              {prettyBytes(thumbnail.value.size)}
            </span>
          )}

          {props.progress === null && <UploadItemDropDown id={props.id} />}
        </div>
        {props.progress !== null && <Progress value={props.progress} />}
      </div>
    </div>
  )
}
