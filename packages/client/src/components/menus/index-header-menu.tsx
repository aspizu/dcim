import {Ellipsis} from "lucide-react"

import {Button} from "#components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "#components/ui/dropdown-menu"

import {UserMenuItems} from "./user-menu-items"

export function IndexHeaderMenu() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <Ellipsis />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <UserMenuItems />
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
