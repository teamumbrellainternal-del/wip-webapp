// src/components/ui/collapsible.stories.tsx
import type { Story } from '@ladle/react'
import { useState } from 'react'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from './collapsible'
import { Button } from './button'
import { ChevronDown, Code } from 'lucide-react'

export default {
  title: 'Components / Collapsible',
}

export const Default: Story = () => {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="p-8 max-w-md">
      <Collapsible open={isOpen} onOpenChange={setIsOpen} className="space-y-2">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-semibold">Environment Variables</h4>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm">
              <ChevronDown
                className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
              />
            </Button>
          </CollapsibleTrigger>
        </div>
        <div className="rounded-md border px-4 py-2 text-sm">
          NODE_ENV=production
        </div>
        <CollapsibleContent className="space-y-2">
          <div className="rounded-md border px-4 py-2 text-sm">
            CLOUDFLARE_ACCOUNT_ID=abc123
          </div>
          <div className="rounded-md border px-4 py-2 text-sm">
            OPENAI_API_KEY=sk-...
          </div>
          <div className="rounded-md border px-4 py-2 text-sm">
            ANTHROPIC_API_KEY=sk-ant-...
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  )
}

Default.meta = {
  description: 'Collapsible section for environment variables',
}

export const CodeSnippet: Story = () => {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="p-8 max-w-2xl">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <div className="flex items-center justify-between rounded-md border px-4 py-2">
          <div className="flex items-center gap-2">
            <Code className="h-4 w-4" />
            <span className="text-sm font-semibold">View Configuration</span>
          </div>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm">
              {isOpen ? 'Hide' : 'Show'}
            </Button>
          </CollapsibleTrigger>
        </div>
        <CollapsibleContent>
          <div className="mt-2 rounded-md border bg-muted p-4">
            <pre className="text-xs">
              {`{
  "name": "my-api-service",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "wrangler dev",
    "deploy": "wrangler deploy"
  }
}`}
            </pre>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  )
}

CodeSnippet.meta = {
  description: 'Collapsible code snippet viewer',
}
