// src/components/ui/form/fields/text-field.stories.tsx
import type { Story } from '@ladle/react'
import { TextField } from './text-field'
import { useState } from 'react'

export default {
  title: 'Form Fields / TextField',
}

export const Basic: Story = () => {
  const [value, setValue] = useState('')
  
  return (
    <div className="max-w-md p-8 space-y-6">
      <TextField
        label="Service Name"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Enter service name"
        description="A unique identifier for your AI service"
      />
    </div>
  )
}

Basic.meta = {
  description: 'Basic text field with label and description',
}

export const WithCharacterCount: Story = () => {
  const [value, setValue] = useState('')
  
  return (
    <div className="max-w-md p-8">
      <TextField
        label="Display Name"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Enter display name"
        description="How this service appears in the UI"
        maxLength={50}
        showCharCount
      />
    </div>
  )
}

WithCharacterCount.meta = {
  description: 'Text field with character counter (brand Catppuccin Peach for warnings)',
}

export const WithError: Story = () => {
  const [value, setValue] = useState('invalid-name!')
  
  return (
    <div className="max-w-md p-8">
      <TextField
        label="Service Name"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        error="Service name can only contain letters, numbers, and hyphens"
        description="A unique identifier for your AI service"
      />
    </div>
  )
}

WithError.meta = {
  description: 'Text field showing validation error (Catppuccin Red)',
}

export const Required: Story = () => {
  const [value, setValue] = useState('')
  
  return (
    <div className="max-w-md p-8">
      <TextField
        label="API Key"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="sk-..."
        required
        description="Your OpenAI API key (required)"
      />
    </div>
  )
}

export const Disabled: Story = () => {
  return (
    <div className="max-w-md p-8">
      <TextField
        label="Machine ID"
        value="leger-amd-01"
        disabled
        description="Auto-generated identifier (cannot be changed)"
      />
    </div>
  )
}
