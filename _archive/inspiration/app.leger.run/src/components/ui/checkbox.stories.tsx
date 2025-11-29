// src/components/ui/checkbox.stories.tsx
import type { Story } from '@ladle/react'
import { Checkbox } from './checkbox'
import { Label } from './label'
import { useState } from 'react'

export default {
  title: 'Components / Checkbox',
}

export const Basic: Story = () => {
  const [checked, setChecked] = useState(false)

  return (
    <div className="p-8 space-y-4">
      <div className="flex items-center space-x-2">
        <Checkbox id="basic" checked={checked} onCheckedChange={setChecked} />
        <Label htmlFor="basic" className="cursor-pointer">
          Enable auto-deployment
        </Label>
      </div>
      <p className="text-sm text-muted-foreground">Checked: {checked.toString()}</p>
    </div>
  )
}

Basic.meta = {
  description: 'Interactive checkbox with label',
}

export const States: Story = () => (
  <div className="p-8 space-y-4">
    <div className="flex items-center space-x-2">
      <Checkbox id="unchecked" />
      <Label htmlFor="unchecked" className="cursor-pointer">
        Unchecked
      </Label>
    </div>

    <div className="flex items-center space-x-2">
      <Checkbox id="checked" defaultChecked />
      <Label htmlFor="checked" className="cursor-pointer">
        Checked
      </Label>
    </div>

    <div className="flex items-center space-x-2">
      <Checkbox id="disabled" disabled />
      <Label htmlFor="disabled" className="text-muted-foreground">
        Disabled
      </Label>
    </div>

    <div className="flex items-center space-x-2">
      <Checkbox id="disabled-checked" disabled defaultChecked />
      <Label htmlFor="disabled-checked" className="text-muted-foreground">
        Disabled & Checked
      </Label>
    </div>
  </div>
)

States.meta = {
  description: 'All checkbox states',
}

export const Group: Story = () => {
  const [selected, setSelected] = useState<string[]>(['notifications'])

  const toggle = (value: string) => {
    setSelected((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    )
  }

  return (
    <div className="p-8 max-w-md space-y-4">
      <div className="space-y-3">
        <p className="text-sm font-medium">Email Preferences</p>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="notifications"
            checked={selected.includes('notifications')}
            onCheckedChange={() => toggle('notifications')}
          />
          <Label htmlFor="notifications" className="cursor-pointer">
            Deployment notifications
          </Label>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="updates"
            checked={selected.includes('updates')}
            onCheckedChange={() => toggle('updates')}
          />
          <Label htmlFor="updates" className="cursor-pointer">
            Product updates
          </Label>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="marketing"
            checked={selected.includes('marketing')}
            onCheckedChange={() => toggle('marketing')}
          />
          <Label htmlFor="marketing" className="cursor-pointer">
            Marketing emails
          </Label>
        </div>
      </div>

      <p className="text-sm text-muted-foreground">
        Selected: {selected.join(', ') || 'none'}
      </p>
    </div>
  )
}

Group.meta = {
  description: 'Checkbox group for multiple selections',
}
