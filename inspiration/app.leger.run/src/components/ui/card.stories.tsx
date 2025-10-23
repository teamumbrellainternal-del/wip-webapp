// src/components/ui/card.stories.tsx
import type { Story } from '@ladle/react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from './card'
import { Button } from './button'
import { Badge } from './badge'

export default {
  title: 'Components / Card',
}

export const Basic: Story = () => (
  <div className="max-w-md p-8">
    <Card>
      <CardHeader>
        <CardTitle>OpenWebUI</CardTitle>
        <CardDescription>
          ChatGPT-like interface for local LLMs
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          A powerful web interface for interacting with your locally deployed
          language models. Supports streaming, conversations, and prompt templates.
        </p>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Badge>Running</Badge>
        <Button variant="outline" size="sm">Configure</Button>
      </CardFooter>
    </Card>
  </div>
)

Basic.meta = {
  description: 'Basic card showing Catppuccin Mocha background colors',
}

export const ServiceStatus: Story = () => (
  <div className="grid gap-4 p-8 md:grid-cols-2 lg:grid-cols-3">
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">OpenWebUI</CardTitle>
          <Badge variant="default">Running</Badge>
        </div>
        <CardDescription>Port 8080</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-sm space-y-1">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Memory</span>
            <span>2.4 GB</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Uptime</span>
            <span>3d 4h</span>
          </div>
        </div>
      </CardContent>
    </Card>
    
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Whisper</CardTitle>
          <Badge variant="secondary">Stopped</Badge>
        </div>
        <CardDescription>Port 8081</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-sm space-y-1">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Memory</span>
            <span className="text-muted-foreground">—</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Uptime</span>
            <span className="text-muted-foreground">—</span>
          </div>
        </div>
      </CardContent>
    </Card>
    
    <Card className="border-destructive/50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Llama.cpp</CardTitle>
          <Badge variant="destructive">Error</Badge>
        </div>
        <CardDescription>Port 8082</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-destructive">
          Failed to bind port. Check configuration.
        </p>
      </CardContent>
    </Card>
  </div>
)

ServiceStatus.meta = {
  description: 'Service status cards showing semantic colors (green/red/yellow)',
}

export const Interactive: Story = () => (
  <div className="max-w-md p-8">
    <Card className="hover:shadow-lg transition-shadow cursor-pointer">
      <CardHeader>
        <CardTitle>Configure Services</CardTitle>
        <CardDescription>
          Customize your AI infrastructure
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          Click to open the web UI and configure which services to deploy,
          resource allocation, and networking settings.
        </p>
      </CardContent>
      <CardFooter>
        <Button className="w-full">Open Configuration</Button>
      </CardFooter>
    </Card>
  </div>
)

Interactive.meta = {
  description: 'Interactive card with hover effect (brand shadow)',
}
