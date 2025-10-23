// src/components/ui/dropdown-menu.stories.tsx
import type { Story } from '@ladle/react'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioItem,
  DropdownMenuRadioGroup,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from './dropdown-menu'
import { Button } from './button'
import { User, Settings, LogOut, Github, Cloud, MoreVertical } from 'lucide-react'

export default {
  title: 'Components / Dropdown Menu',
}

export const Default: Story = () => (
  <div className="p-8 flex justify-center">
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">
          <User className="mr-2 h-4 w-4" />
          Account
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>My Account</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <User className="mr-2 h-4 w-4" />
          Profile
          <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Settings className="mr-2 h-4 w-4" />
          Settings
          <DropdownMenuShortcut>⌘S</DropdownMenuShortcut>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <LogOut className="mr-2 h-4 w-4" />
          Log out
          <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  </div>
)

Default.meta = {
  description: 'User account dropdown with icons and keyboard shortcuts',
}

export const WithCheckboxes: Story = () => {
  return (
    <div className="p-8 flex justify-center">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline">View Options</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuLabel>Display Settings</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuCheckboxItem checked>
            Show API Keys
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem checked>
            Show Releases
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem>
            Show Hidden Services
          </DropdownMenuCheckboxItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

WithCheckboxes.meta = {
  description: 'Dropdown menu with checkbox items',
}

export const WithRadioGroup: Story = () => {
  return (
    <div className="p-8 flex justify-center">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline">Deploy Region</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuLabel>Select Region</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuRadioGroup value="us-east">
            <DropdownMenuRadioItem value="us-east">
              US East (N. Virginia)
            </DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="us-west">
              US West (Oregon)
            </DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="eu-west">
              EU West (Ireland)
            </DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="ap-southeast">
              Asia Pacific (Singapore)
            </DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

WithRadioGroup.meta = {
  description: 'Dropdown menu with radio button group',
}

export const WithSubmenu: Story = () => (
  <div className="p-8 flex justify-center">
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem>View Details</DropdownMenuItem>
        <DropdownMenuItem>Edit Service</DropdownMenuItem>
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <Cloud className="mr-2 h-4 w-4" />
            Deploy To
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            <DropdownMenuItem>Cloudflare Workers</DropdownMenuItem>
            <DropdownMenuItem>Cloudflare Pages</DropdownMenuItem>
            <DropdownMenuItem>R2 Storage</DropdownMenuItem>
          </DropdownMenuSubContent>
        </DropdownMenuSub>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="text-destructive">
          Delete Service
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  </div>
)

WithSubmenu.meta = {
  description: 'Dropdown menu with nested submenu',
}
