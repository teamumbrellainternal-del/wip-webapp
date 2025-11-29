// src/components/ui/select.stories.tsx
import type { Story } from '@ladle/react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectGroup,
  SelectLabel,
} from './select'
import { Label } from './label'

export default {
  title: 'Form Fields / Select',
}

export const Default: Story = () => (
  <div className="p-8 max-w-md space-y-4">
    <div className="space-y-2">
      <Label>Deploy Region</Label>
      <Select defaultValue="us-east">
        <SelectTrigger>
          <SelectValue placeholder="Select a region" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="us-east">US East (N. Virginia)</SelectItem>
          <SelectItem value="us-west">US West (Oregon)</SelectItem>
          <SelectItem value="eu-west">EU West (Ireland)</SelectItem>
          <SelectItem value="ap-southeast">Asia Pacific (Singapore)</SelectItem>
        </SelectContent>
      </Select>
    </div>
  </div>
)

Default.meta = {
  description: 'Basic select component for choosing options',
}

export const WithGroups: Story = () => (
  <div className="p-8 max-w-md space-y-4">
    <div className="space-y-2">
      <Label>AI Model</Label>
      <Select>
        <SelectTrigger>
          <SelectValue placeholder="Select an AI model" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>OpenAI</SelectLabel>
            <SelectItem value="gpt-4">GPT-4</SelectItem>
            <SelectItem value="gpt-4-turbo">GPT-4 Turbo</SelectItem>
            <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
          </SelectGroup>
          <SelectGroup>
            <SelectLabel>Anthropic</SelectLabel>
            <SelectItem value="claude-3-opus">Claude 3 Opus</SelectItem>
            <SelectItem value="claude-3-sonnet">Claude 3 Sonnet</SelectItem>
            <SelectItem value="claude-3-haiku">Claude 3 Haiku</SelectItem>
          </SelectGroup>
          <SelectGroup>
            <SelectLabel>Google</SelectLabel>
            <SelectItem value="gemini-pro">Gemini Pro</SelectItem>
            <SelectItem value="gemini-ultra">Gemini Ultra</SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  </div>
)

WithGroups.meta = {
  description: 'Select with grouped options',
}

export const Multiple: Story = () => (
  <div className="p-8 max-w-md space-y-4">
    <div className="space-y-2">
      <Label>Service Type</Label>
      <Select defaultValue="worker">
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="worker">Cloudflare Worker</SelectItem>
          <SelectItem value="pages">Cloudflare Pages</SelectItem>
          <SelectItem value="r2">R2 Storage</SelectItem>
          <SelectItem value="d1">D1 Database</SelectItem>
        </SelectContent>
      </Select>
    </div>

    <div className="space-y-2">
      <Label>Git Branch</Label>
      <Select defaultValue="main">
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="main">main</SelectItem>
          <SelectItem value="develop">develop</SelectItem>
          <SelectItem value="staging">staging</SelectItem>
          <SelectItem value="production">production</SelectItem>
        </SelectContent>
      </Select>
    </div>
  </div>
)

Multiple.meta = {
  description: 'Multiple select components in a form',
}
