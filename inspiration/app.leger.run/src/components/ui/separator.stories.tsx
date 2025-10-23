// src/components/ui/separator.stories.tsx
import type { Story } from '@ladle/react'
import { Separator } from './separator'

export default {
  title: 'Utility / Separator',
}

export const Horizontal: Story = () => (
  <div className="p-8 max-w-md space-y-4">
    <div>
      <h4 className="text-sm font-medium">Service Configuration</h4>
      <p className="text-sm text-muted-foreground">Manage your AI service settings</p>
    </div>
    <Separator />
    <div>
      <h4 className="text-sm font-medium">Deployment Settings</h4>
      <p className="text-sm text-muted-foreground">Configure release behavior</p>
    </div>
    <Separator />
    <div>
      <h4 className="text-sm font-medium">Environment Variables</h4>
      <p className="text-sm text-muted-foreground">Set runtime secrets</p>
    </div>
  </div>
)

Horizontal.meta = {
  description: 'Horizontal separator (default)',
}

export const Vertical: Story = () => (
  <div className="p-8">
    <div className="flex h-16 items-center space-x-4 text-sm">
      <div>API Keys</div>
      <Separator orientation="vertical" />
      <div>Releases</div>
      <Separator orientation="vertical" />
      <div>Settings</div>
      <Separator orientation="vertical" />
      <div>Docs</div>
    </div>
  </div>
)

Vertical.meta = {
  description: 'Vertical separator for navigation',
}
