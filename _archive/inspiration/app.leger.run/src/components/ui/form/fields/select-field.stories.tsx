// src/components/ui/form/fields/select-field.stories.tsx
import type { Story } from '@ladle/react'
import { SelectField } from './select-field'
import { useState } from 'react'

export default {
  title: 'Form Fields / SelectField',
}

const frameworkOptions = [
  { value: 'nextjs', label: 'Next.js' },
  { value: 'remix', label: 'Remix' },
  { value: 'astro', label: 'Astro' },
  { value: 'sveltekit', label: 'SvelteKit' },
  { value: 'nuxt', label: 'Nuxt' },
]

export const Basic: Story = () => {
  const [value, setValue] = useState('')

  return (
    <div className="max-w-md p-8">
      <SelectField
        label="Framework"
        description="Select your preferred web framework"
        options={frameworkOptions}
        value={value}
        onChange={setValue}
        placeholder="Choose a framework"
      />
    </div>
  )
}

Basic.meta = {
  description: 'Basic select field with options',
}

export const WithDefaultValue: Story = () => {
  const [value, setValue] = useState('nextjs')

  return (
    <div className="max-w-md p-8">
      <SelectField
        label="Framework"
        description="Your default deployment framework"
        options={frameworkOptions}
        value={value}
        onChange={setValue}
      />
    </div>
  )
}

WithDefaultValue.meta = {
  description: 'Select field with pre-selected value',
}

export const WithError: Story = () => {
  const [value, setValue] = useState('')

  return (
    <div className="max-w-md p-8">
      <SelectField
        label="Framework"
        description="Required for deployment configuration"
        options={frameworkOptions}
        value={value}
        onChange={setValue}
        error="Framework selection is required"
        placeholder="Choose a framework"
      />
    </div>
  )
}

WithError.meta = {
  description: 'Select field showing validation error',
}

export const Disabled: Story = () => {
  const [value, setValue] = useState('nextjs')

  return (
    <div className="max-w-md p-8">
      <SelectField
        label="Framework"
        description="Framework is locked for this service"
        options={frameworkOptions}
        value={value}
        onChange={setValue}
        disabled
      />
    </div>
  )
}

Disabled.meta = {
  description: 'Disabled select field',
}

export const EnvironmentSelector: Story = () => {
  const [env, setEnv] = useState('production')

  const environments = [
    { value: 'development', label: 'Development' },
    { value: 'staging', label: 'Staging' },
    { value: 'production', label: 'Production' },
  ]

  return (
    <div className="max-w-md p-8 space-y-4">
      <SelectField
        label="Target Environment"
        description="Select which environment to deploy to"
        options={environments}
        value={env}
        onChange={setEnv}
      />
      <p className="text-sm text-muted-foreground">
        Selected: {env}
      </p>
    </div>
  )
}

EnvironmentSelector.meta = {
  description: 'Real-world example: environment selector',
}
