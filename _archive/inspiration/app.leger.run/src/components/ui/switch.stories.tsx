// src/components/ui/switch.stories.tsx
import type { Story } from '@ladle/react'
import { Switch } from './switch'
import { Label } from './label'
import { useState } from 'react'

export default {
  title: 'Components / Switch',
}

export const Basic: Story = () => {
  const [enabled, setEnabled] = useState(false)

  return (
    <div className="p-8 space-y-4">
      <div className="flex items-center space-x-2">
        <Switch id="basic" checked={enabled} onCheckedChange={setEnabled} />
        <Label htmlFor="basic" className="cursor-pointer">
          Enable feature flag
        </Label>
      </div>
      <p className="text-sm text-muted-foreground">Enabled: {enabled.toString()}</p>
    </div>
  )
}

Basic.meta = {
  description: 'Interactive switch with label',
}

export const States: Story = () => (
  <div className="p-8 space-y-4">
    <div className="flex items-center space-x-2">
      <Switch id="off" />
      <Label htmlFor="off" className="cursor-pointer">
        Off (default)
      </Label>
    </div>

    <div className="flex items-center space-x-2">
      <Switch id="on" defaultChecked />
      <Label htmlFor="on" className="cursor-pointer">
        On (checked)
      </Label>
    </div>

    <div className="flex items-center space-x-2">
      <Switch id="disabled" disabled />
      <Label htmlFor="disabled" className="text-muted-foreground">
        Disabled
      </Label>
    </div>

    <div className="flex items-center space-x-2">
      <Switch id="disabled-on" disabled defaultChecked />
      <Label htmlFor="disabled-on" className="text-muted-foreground">
        Disabled & On
      </Label>
    </div>
  </div>
)

States.meta = {
  description: 'All switch states',
}

export const Settings: Story = () => {
  const [settings, setSettings] = useState({
    autoDeploy: true,
    notifications: false,
    analytics: true,
  })

  const updateSetting = (key: keyof typeof settings) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  return (
    <div className="p-8 max-w-md space-y-4">
      <div className="space-y-4 rounded-lg border p-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="auto-deploy" className="cursor-pointer">
              Auto-deploy on push
            </Label>
            <p className="text-sm text-muted-foreground">
              Automatically deploy when pushing to main branch
            </p>
          </div>
          <Switch
            id="auto-deploy"
            checked={settings.autoDeploy}
            onCheckedChange={() => updateSetting('autoDeploy')}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="notifications" className="cursor-pointer">
              Email notifications
            </Label>
            <p className="text-sm text-muted-foreground">
              Receive deployment status emails
            </p>
          </div>
          <Switch
            id="notifications"
            checked={settings.notifications}
            onCheckedChange={() => updateSetting('notifications')}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="analytics" className="cursor-pointer">
              Usage analytics
            </Label>
            <p className="text-sm text-muted-foreground">
              Help us improve by sharing anonymous usage data
            </p>
          </div>
          <Switch
            id="analytics"
            checked={settings.analytics}
            onCheckedChange={() => updateSetting('analytics')}
          />
        </div>
      </div>
    </div>
  )
}

Settings.meta = {
  description: 'Switches in a settings panel layout',
}
