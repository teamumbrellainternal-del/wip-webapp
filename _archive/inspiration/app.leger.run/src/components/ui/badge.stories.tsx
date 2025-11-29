// src/components/ui/badge.stories.tsx
import type { Story } from '@ladle/react'
import { Badge } from './badge'

export default {
  title: 'Components / Badge',
}

export const Variants: Story = () => (
  <div className="space-y-4 p-8">
    <div className="space-y-2">
      <h3 className="text-sm font-medium text-muted-foreground">Default (Brand Yellow)</h3>
      <div className="flex items-center gap-2">
        <Badge>New</Badge>
        <Badge>Production</Badge>
        <Badge>v1.2.3</Badge>
      </div>
    </div>

    <div className="space-y-2">
      <h3 className="text-sm font-medium text-muted-foreground">Secondary</h3>
      <div className="flex items-center gap-2">
        <Badge variant="secondary">Pending</Badge>
        <Badge variant="secondary">Beta</Badge>
        <Badge variant="secondary">Draft</Badge>
      </div>
    </div>

    <div className="space-y-2">
      <h3 className="text-sm font-medium text-muted-foreground">Destructive</h3>
      <div className="flex items-center gap-2">
        <Badge variant="destructive">Error</Badge>
        <Badge variant="destructive">Failed</Badge>
        <Badge variant="destructive">Deprecated</Badge>
      </div>
    </div>

    <div className="space-y-2">
      <h3 className="text-sm font-medium text-muted-foreground">Outline</h3>
      <div className="flex items-center gap-2">
        <Badge variant="outline">Coming Soon</Badge>
        <Badge variant="outline">Optional</Badge>
        <Badge variant="outline">Experimental</Badge>
      </div>
    </div>
  </div>
)

Variants.meta = {
  description: 'All badge variants with Catppuccin color palette',
}

export const InContext: Story = () => (
  <div className="space-y-4 p-8">
    <div className="flex items-center gap-2">
      <span className="text-sm">API Status:</span>
      <Badge>Healthy</Badge>
    </div>

    <div className="flex items-center gap-2">
      <span className="text-sm">Release:</span>
      <Badge variant="secondary">v0.1.0</Badge>
    </div>

    <div className="flex items-center gap-2">
      <span className="text-sm">Build:</span>
      <Badge variant="destructive">Failed</Badge>
    </div>
  </div>
)

InContext.meta = {
  description: 'Badges used alongside text content',
}
