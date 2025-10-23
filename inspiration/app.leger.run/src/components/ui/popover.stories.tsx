// src/components/ui/popover.stories.tsx
import type { Story } from '@ladle/react'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from './popover'
import { Button } from './button'
import { Input } from './input'
import { Label } from './label'
import { Settings, Calendar, User } from 'lucide-react'

export default {
  title: 'Components / Popover',
}

export const Default: Story = () => (
  <div className="p-8 flex justify-center">
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline">Open Popover</Button>
      </PopoverTrigger>
      <PopoverContent>
        <div className="space-y-2">
          <h4 className="font-medium leading-none">Quick Actions</h4>
          <p className="text-sm text-muted-foreground">
            Manage your deployment settings
          </p>
        </div>
      </PopoverContent>
    </Popover>
  </div>
)

Default.meta = {
  description: 'Basic popover with text content',
}

export const WithForm: Story = () => (
  <div className="p-8 flex justify-center">
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline">
          <Settings className="mr-2 h-4 w-4" />
          Configure
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="space-y-4">
          <div className="space-y-2">
            <h4 className="font-medium leading-none">Service Configuration</h4>
            <p className="text-sm text-muted-foreground">
              Update your service settings
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="name">Service Name</Label>
            <Input id="name" defaultValue="my-api-service" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="timeout">Timeout (seconds)</Label>
            <Input id="timeout" type="number" defaultValue="30" />
          </div>
          <Button className="w-full">Save Changes</Button>
        </div>
      </PopoverContent>
    </Popover>
  </div>
)

WithForm.meta = {
  description: 'Popover containing a form',
}

export const UserProfile: Story = () => (
  <div className="p-8 flex justify-center">
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="rounded-full">
          <User className="h-5 w-5" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64">
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="h-6 w-6" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">user@example.com</p>
              <p className="text-xs text-muted-foreground">tailnet.ts.net</p>
            </div>
          </div>
          <div className="border-t pt-3 space-y-1">
            <Button variant="ghost" size="sm" className="w-full justify-start">
              Account Settings
            </Button>
            <Button variant="ghost" size="sm" className="w-full justify-start">
              Billing
            </Button>
            <Button variant="ghost" size="sm" className="w-full justify-start text-destructive">
              Sign Out
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  </div>
)

UserProfile.meta = {
  description: 'User profile popover with actions',
}
