// src/components/ui/button.stories.tsx
import type { Story } from '@ladle/react'
import { Button } from './button'
import { Loader2, Download, Trash2 } from 'lucide-react'

export default {
  title: 'Components / Button',
}

export const Default: Story = () => (
  <div className="space-y-4 p-8">
    <div className="space-y-2">
      <h3 className="text-sm font-medium text-muted-foreground">Primary (Brand Yellow)</h3>
      <Button>Deploy Service</Button>
    </div>
    
    <div className="space-y-2">
      <h3 className="text-sm font-medium text-muted-foreground">Secondary</h3>
      <Button variant="secondary">Cancel</Button>
    </div>
    
    <div className="space-y-2">
      <h3 className="text-sm font-medium text-muted-foreground">Outline</h3>
      <Button variant="outline">View Logs</Button>
    </div>
    
    <div className="space-y-2">
      <h3 className="text-sm font-medium text-muted-foreground">Ghost</h3>
      <Button variant="ghost">Settings</Button>
    </div>
    
    <div className="space-y-2">
      <h3 className="text-sm font-medium text-muted-foreground">Destructive</h3>
      <Button variant="destructive">Delete Service</Button>
    </div>
  </div>
)

Default.meta = {
  description: 'All button variants showing Catppuccin color palette',
}

export const WithIcons: Story = () => (
  <div className="space-x-4 p-8">
    <Button>
      <Download className="mr-2 h-4 w-4" />
      Export Config
    </Button>
    
    <Button variant="destructive">
      <Trash2 className="mr-2 h-4 w-4" />
      Remove
    </Button>
  </div>
)

WithIcons.meta = {
  description: 'Buttons with icons (Lucide React)',
}

export const Sizes: Story = () => (
  <div className="space-x-4 p-8 flex items-center">
    <Button size="sm">Small</Button>
    <Button size="default">Default</Button>
    <Button size="lg">Large</Button>
    <Button size="icon">
      <Download className="h-4 w-4" />
    </Button>
  </div>
)

export const States: Story = () => (
  <div className="space-x-4 p-8">
    <Button>Normal</Button>
    <Button disabled>Disabled</Button>
    <Button>
      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      Loading
    </Button>
  </div>
)
