// src/components/ui/form/fields/toggle-field.stories.tsx
import type { Story } from '@ladle/react'
import { ToggleField } from './toggle-field'
import { useState } from 'react'

export default {
  title: 'Form Fields / ToggleField',
}

export const Basic: Story = () => {
  const [checked, setChecked] = useState(false)
  
  return (
    <div className="max-w-md p-8 space-y-6">
      <ToggleField
        label="Enable Feature"
        description="Turn this feature on or off"
        checked={checked}
        onCheckedChange={setChecked}
      />
    </div>
  )
}

Basic.meta = {
  description: 'Basic toggle switch with label (Catppuccin Yellow when active)',
}

export const CheckedByDefault: Story = () => {
  const [checked, setChecked] = useState(true)
  
  return (
    <div className="max-w-md p-8">
      <ToggleField
        label="Auto-save"
        description="Automatically save changes"
        checked={checked}
        onCheckedChange={setChecked}
      />
    </div>
  )
}

WithError.meta = {
  description: 'Toggle field enabled by default',
}

export const MultipleToggles: Story = () => {
  const [features, setFeatures] = useState({
    analytics: true,
    notifications: false,
    darkMode: true,
    betaFeatures: false,
  })
  
  return (
    <div className="max-w-md p-8 space-y-4">
      <h3 className="text-lg font-semibold mb-4">Feature Flags</h3>
      
      <ToggleField
        label="Analytics"
        description="Track user behavior and metrics"
        checked={features.analytics}
        onCheckedChange={(checked) => setFeatures({ ...features, analytics: checked })}
      />
      
      <ToggleField
        label="Notifications"
        description="Enable push notifications"
        checked={features.notifications}
        onCheckedChange={(checked) => setFeatures({ ...features, notifications: checked })}
      />
      
      <ToggleField
        label="Dark Mode"
        description="Use dark color scheme"
        checked={features.darkMode}
        onCheckedChange={(checked) => setFeatures({ ...features, darkMode: checked })}
      />
      
      <ToggleField
        label="Beta Features"
        description="Access experimental features (may be unstable)"
        checked={features.betaFeatures}
        onCheckedChange={(checked) => setFeatures({ ...features, betaFeatures: checked })}
      />
    </div>
  )
}

MultipleToggles.meta = {
  description: 'Multiple toggle fields for feature management',
}

export const Disabled: Story = () => {
  return (
    <div className="max-w-md p-8 space-y-4">
      <ToggleField
        label="Pro Feature"
        description="Available on Pro plan only"
        checked={false}
        onCheckedChange={() => {}}
        disabled
      />
      
      <ToggleField
        label="Admin Access"
        description="Requires admin privileges"
        checked={true}
        onCheckedChange={() => {}}
        disabled
      />
    </div>
  )
}
