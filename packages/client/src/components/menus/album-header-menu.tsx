import {Ellipsis, Trash} from "lucide-react"
import {useState} from "react"

import {Button} from "#components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "#components/ui/dropdown-menu"
import type {Album} from "#services/api"
import {$authState, AuthState} from "#stores/auth"

import {DeleteAlbumDialog} from "../dialogs"
import {UserMenuItems} from "./user-menu-items"

export function AlbumHeaderMenu(props: {album: Album}) {
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <Ellipsis />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          {$authState.value === AuthState.AUTHENTICATED && (
            <>
              <DropdownMenuGroup>
                <DropdownMenuItem
                  variant="destructive"
                  onClick={() => {
                    setIsDeleteOpen(true)
                  }}
                >
                  <Trash />
                  Delete album
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
            </>
          )}
          <UserMenuItems />
        </DropdownMenuContent>
      </DropdownMenu>
      <DeleteAlbumDialog
        album={props.album}
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
      />
    </>
  )
}
