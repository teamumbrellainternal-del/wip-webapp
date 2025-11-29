// src/components/ui/alert.stories.tsx
import type { Story } from '@ladle/react'
import { Alert, AlertDescription, AlertTitle } from './alert'
import { AlertCircle, CheckCircle2, Info, AlertTriangle } from 'lucide-react'

export default {
  title: 'Feedback / Alert',
}

export const Default: Story = () => (
  <div className="space-y-4 p-8 max-w-2xl">
    <Alert>
      <Info className="h-4 w-4" />
      <AlertTitle>Information</AlertTitle>
      <AlertDescription>
        Your API key will expire in 30 days. Consider rotating it soon.
      </AlertDescription>
    </Alert>
  </div>
)

Default.meta = {
  description: 'Default alert style (Catppuccin Blue)',
}

export const Destructive: Story = () => (
  <div className="space-y-4 p-8 max-w-2xl">
    <Alert variant="destructive">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Error</AlertTitle>
      <AlertDescription>
        Failed to deploy service. Invalid configuration detected in release.yaml.
      </AlertDescription>
    </Alert>
  </div>
)

Destructive.meta = {
  description: 'Destructive alert for errors (Catppuccin Red)',
}

export const AllVariants: Story = () => (
  <div className="space-y-4 p-8 max-w-2xl">
    <Alert>
      <Info className="h-4 w-4" />
      <AlertTitle>Deployment Started</AlertTitle>
      <AlertDescription>
        Your service is being deployed to production. This may take a few minutes.
      </AlertDescription>
    </Alert>

    <Alert>
      <CheckCircle2 className="h-4 w-4" />
      <AlertTitle>Success</AlertTitle>
      <AlertDescription>
        Service deployed successfully to production environment.
      </AlertDescription>
    </Alert>

    <Alert>
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle>Warning</AlertTitle>
      <AlertDescription>
        This API key has not been used in 90 days. Consider removing it if no longer needed.
      </AlertDescription>
    </Alert>

    <Alert variant="destructive">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Configuration Error</AlertTitle>
      <AlertDescription>
        Missing required environment variable: DATABASE_URL
      </AlertDescription>
    </Alert>
  </div>
)

AllVariants.meta = {
  description: 'Common alert use cases with icons',
}

export const TitleOnly: Story = () => (
  <div className="space-y-4 p-8 max-w-2xl">
    <Alert>
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Heads up! Your secrets are syncing...</AlertTitle>
    </Alert>
  </div>
)

TitleOnly.meta = {
  description: 'Alert with title only (no description)',
}
