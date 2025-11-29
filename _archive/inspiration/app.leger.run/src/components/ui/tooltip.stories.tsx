// src/components/ui/tooltip.stories.tsx
import type { Story } from '@ladle/react'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from './tooltip'
import { Button } from './button'
import { Info, HelpCircle, AlertTriangle } from 'lucide-react'

export default {
  title: 'Feedback / Tooltip',
}

export const Default: Story = () => (
  <div className="p-8 flex justify-center">
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="outline">Hover me</Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>This is a helpful tooltip</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  </div>
)

Default.meta = {
  description: 'Basic tooltip on button hover',
}

export const WithIcon: Story = () => (
  <div className="p-8 flex justify-center gap-4">
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="icon">
            <Info className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>API keys are encrypted at rest</p>
        </TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="icon">
            <HelpCircle className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Click to view documentation</p>
        </TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="icon">
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Service is currently offline</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  </div>
)

WithIcon.meta = {
  description: 'Tooltips on icon buttons',
}

export const Detailed: Story = () => (
  <div className="p-8 flex justify-center">
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="outline">Deploy Service</Button>
        </TooltipTrigger>
        <TooltipContent className="max-w-xs">
          <p className="font-semibold mb-1">Deploy to Cloudflare Workers</p>
          <p className="text-xs">
            This will build your code from the latest Git commit and deploy it to
            your Cloudflare account. The deployment usually takes 30-60 seconds.
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  </div>
)

Detailed.meta = {
  description: 'Tooltip with detailed multi-line content',
}

export const Positioning: Story = () => (
  <div className="p-8 flex justify-center gap-4">
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="outline">Top</Button>
        </TooltipTrigger>
        <TooltipContent side="top">
          <p>Appears on top</p>
        </TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="outline">Bottom</Button>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          <p>Appears on bottom</p>
        </TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="outline">Left</Button>
        </TooltipTrigger>
        <TooltipContent side="left">
          <p>Appears on left</p>
        </TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="outline">Right</Button>
        </TooltipTrigger>
        <TooltipContent side="right">
          <p>Appears on right</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  </div>
)

Positioning.meta = {
  description: 'Tooltips with different positioning',
}
