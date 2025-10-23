// src/components/ui/input.stories.tsx
import type { Story } from '@ladle/react'
import { Input } from './input'
import { Label } from './label'
import { Search, Mail } from 'lucide-react'

export default {
  title: 'Components / Input',
}

export const Default: Story = () => (
  <div className="p-8 max-w-md space-y-4">
    <div className="space-y-2">
      <Label htmlFor="name">Name</Label>
      <Input id="name" placeholder="Enter your name" />
    </div>
  </div>
)

Default.meta = {
  description: 'Basic input field',
}

export const Types: Story = () => (
  <div className="p-8 max-w-md space-y-4">
    <div className="space-y-2">
      <Label htmlFor="email">Email</Label>
      <Input id="email" type="email" placeholder="name@example.com" />
    </div>

    <div className="space-y-2">
      <Label htmlFor="password">Password</Label>
      <Input id="password" type="password" placeholder="••••••••" />
    </div>

    <div className="space-y-2">
      <Label htmlFor="number">Port</Label>
      <Input id="number" type="number" placeholder="8080" />
    </div>

    <div className="space-y-2">
      <Label htmlFor="url">Git URL</Label>
      <Input id="url" type="url" placeholder="https://github.com/user/repo" />
    </div>
  </div>
)

Types.meta = {
  description: 'Different input types',
}

export const WithIcon: Story = () => (
  <div className="p-8 max-w-md space-y-4">
    <div className="space-y-2">
      <Label htmlFor="search">Search</Label>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input id="search" className="pl-10" placeholder="Search services..." />
      </div>
    </div>

    <div className="space-y-2">
      <Label htmlFor="email-icon">Email</Label>
      <div className="relative">
        <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input id="email-icon" className="pl-10" type="email" placeholder="you@example.com" />
      </div>
    </div>
  </div>
)

WithIcon.meta = {
  description: 'Input fields with icons',
}

export const States: Story = () => (
  <div className="p-8 max-w-md space-y-4">
    <div className="space-y-2">
      <Label htmlFor="default">Default</Label>
      <Input id="default" placeholder="Type here..." />
    </div>

    <div className="space-y-2">
      <Label htmlFor="disabled">Disabled</Label>
      <Input id="disabled" placeholder="Cannot edit" disabled />
    </div>

    <div className="space-y-2">
      <Label htmlFor="readonly">Read Only</Label>
      <Input id="readonly" value="read-only-value" readOnly />
    </div>
  </div>
)

States.meta = {
  description: 'Input states (default, disabled, readonly)',
}
