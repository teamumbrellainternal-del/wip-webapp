// src/components/ui/tabs.stories.tsx
import type { Story } from '@ladle/react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './card'

export default {
  title: 'Components / Tabs',
}

export const Basic: Story = () => (
  <div className="p-8">
    <Tabs defaultValue="overview" className="w-[600px]">
      <TabsList>
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="deployment">Deployment</TabsTrigger>
        <TabsTrigger value="settings">Settings</TabsTrigger>
      </TabsList>
      <TabsContent value="overview">
        <p className="text-sm text-muted-foreground">
          Service overview and stats will appear here.
        </p>
      </TabsContent>
      <TabsContent value="deployment">
        <p className="text-sm text-muted-foreground">
          Deployment configuration and history.
        </p>
      </TabsContent>
      <TabsContent value="settings">
        <p className="text-sm text-muted-foreground">
          Service settings and preferences.
        </p>
      </TabsContent>
    </Tabs>
  </div>
)

Basic.meta = {
  description: 'Basic tabs with simple content',
}

export const WithCards: Story = () => (
  <div className="p-8">
    <Tabs defaultValue="api-keys" className="w-[700px]">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="api-keys">API Keys</TabsTrigger>
        <TabsTrigger value="secrets">Secrets</TabsTrigger>
        <TabsTrigger value="releases">Releases</TabsTrigger>
      </TabsList>

      <TabsContent value="api-keys">
        <Card>
          <CardHeader>
            <CardTitle>API Keys</CardTitle>
            <CardDescription>
              Manage your API keys for external services like OpenAI and Anthropic.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-sm">No API keys configured yet.</p>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="secrets">
        <Card>
          <CardHeader>
            <CardTitle>Environment Secrets</CardTitle>
            <CardDescription>
              Store sensitive environment variables securely.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-sm">No secrets stored yet.</p>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="releases">
        <Card>
          <CardHeader>
            <CardTitle>Release History</CardTitle>
            <CardDescription>
              View your deployment history and release notes.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-sm">No releases deployed yet.</p>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  </div>
)

WithCards.meta = {
  description: 'Tabs with card content (common layout pattern)',
}

export const FullWidth: Story = () => (
  <div className="p-8">
    <Tabs defaultValue="overview" className="w-full">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="metrics">Metrics</TabsTrigger>
        <TabsTrigger value="logs">Logs</TabsTrigger>
        <TabsTrigger value="settings">Settings</TabsTrigger>
      </TabsList>
      <TabsContent value="overview" className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Active Services</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">12</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Total Deployments</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">48</p>
            </CardContent>
          </Card>
        </div>
      </TabsContent>
      <TabsContent value="metrics">
        <p className="text-sm text-muted-foreground">Usage metrics and analytics</p>
      </TabsContent>
      <TabsContent value="logs">
        <p className="text-sm text-muted-foreground">Application logs</p>
      </TabsContent>
      <TabsContent value="settings">
        <p className="text-sm text-muted-foreground">Service configuration</p>
      </TabsContent>
    </Tabs>
  </div>
)

FullWidth.meta = {
  description: 'Full-width tabs with dashboard layout',
}
