// src/components/ui/label.stories.tsx
import type { Story } from '@ladle/react'
import { Label } from './label'
import { Input } from './input'
import { Checkbox } from './checkbox'

export default {
  title: 'Components / Label',
}

export const WithInput: Story = () => (
  <div className="p-8 max-w-md space-y-4">
    <div className="space-y-2">
      <Label htmlFor="service">Service Name</Label>
      <Input id="service" placeholder="my-ai-service" />
    </div>
  </div>
)

WithInput.meta = {
  description: 'Label paired with input field',
}

export const WithCheckbox: Story = () => (
  <div className="p-8 max-w-md space-y-4">
    <div className="flex items-center space-x-2">
      <Checkbox id="terms" />
      <Label htmlFor="terms" className="text-sm font-normal cursor-pointer">
        Accept terms and conditions
      </Label>
    </div>

    <div className="flex items-center space-x-2">
      <Checkbox id="marketing" />
      <Label htmlFor="marketing" className="text-sm font-normal cursor-pointer">
        Send me marketing emails
      </Label>
    </div>
  </div>
)

WithCheckbox.meta = {
  description: 'Label with checkbox (clickable)',
}

export const Required: Story = () => (
  <div className="p-8 max-w-md space-y-4">
    <div className="space-y-2">
      <Label htmlFor="apikey">
        API Key <span className="text-destructive">*</span>
      </Label>
      <Input id="apikey" placeholder="sk-..." required />
    </div>
  </div>
)

Required.meta = {
  description: 'Label with required indicator',
}
