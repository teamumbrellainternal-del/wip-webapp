// src/components/ui/form/layouts/category-section.stories.tsx
import type { Story } from '@ladle/react'
import { CategorySection } from './category-section'
import { TextField } from '../fields/text-field'
import { SelectField } from '../fields/select-field'
import { ToggleField } from '../fields/toggle-field'
import { useState } from 'react'

export default {
  title: 'Form Layouts / CategorySection',
}

export const Basic: Story = () => {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')

  return (
    <div className="p-8 max-w-2xl">
      <CategorySection
        title="Service Configuration"
        description="Configure your AI service settings"
      >
        <TextField
          label="Service Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="my-ai-service"
          description="A unique identifier for your service"
        />
        <TextField
          label="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe your service"
          description="Optional description shown in the dashboard"
        />
      </CategorySection>
    </div>
  )
}

Basic.meta = {
  description: 'Basic category section with form fields',
}

export const WithSaveButton: Story = () => {
  const [name, setName] = useState('my-service')
  const [isDirty, setIsDirty] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleChange = (value: string) => {
    setName(value)
    setIsDirty(value !== 'my-service')
  }

  const handleSave = () => {
    setIsLoading(true)
    setTimeout(() => {
      setIsLoading(false)
      setIsDirty(false)
    }, 1000)
  }

  return (
    <div className="p-8 max-w-2xl">
      <CategorySection
        title="Service Configuration"
        description="Changes will be saved to your configuration"
        isDirty={isDirty}
        isLoading={isLoading}
        onSave={handleSave}
        saveText="Save Changes"
      >
        <TextField
          label="Service Name"
          value={name}
          onChange={(e) => handleChange(e.target.value)}
          description="Edit to see save button activate"
        />
      </CategorySection>
    </div>
  )
}

WithSaveButton.meta = {
  description: 'Category section with save functionality',
}

export const WithDocumentation: Story = () => {
  const [model, setModel] = useState('gpt-4')

  return (
    <div className="p-8 max-w-2xl">
      <CategorySection
        title="OpenAI Configuration"
        description="Configure your OpenAI API settings"
        documentationLink={{
          text: 'OpenAI API Documentation',
          href: 'https://platform.openai.com/docs',
        }}
      >
        <SelectField
          label="Model"
          value={model}
          onChange={setModel}
          options={[
            { value: 'gpt-4', label: 'GPT-4' },
            { value: 'gpt-4-turbo', label: 'GPT-4 Turbo' },
            { value: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo' },
          ]}
          description="Select the OpenAI model to use"
        />
      </CategorySection>
    </div>
  )
}

WithDocumentation.meta = {
  description: 'Category section with documentation link',
}

export const CompleteExample: Story = () => {
  const [config, setConfig] = useState({
    apiKey: '',
    model: 'gpt-4',
    streaming: true,
  })
  const [isDirty, setIsDirty] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const updateConfig = (key: string, value: string | boolean) => {
    setConfig((prev) => ({ ...prev, [key]: value }))
    setIsDirty(true)
  }

  const handleSave = () => {
    setIsLoading(true)
    setTimeout(() => {
      setIsLoading(false)
      setIsDirty(false)
    }, 1500)
  }

  return (
    <div className="p-8 max-w-2xl">
      <CategorySection
        title="Anthropic API Configuration"
        description="Configure your Anthropic Claude API settings"
        isDirty={isDirty}
        isLoading={isLoading}
        onSave={handleSave}
        documentationLink={{
          text: 'Anthropic API Docs',
          href: 'https://docs.anthropic.com',
        }}
      >
        <TextField
          label="API Key"
          value={config.apiKey}
          onChange={(e) => updateConfig('apiKey', e.target.value)}
          placeholder="sk-ant-..."
          description="Your Anthropic API key"
        />

        <SelectField
          label="Model"
          value={config.model}
          onChange={(v) => updateConfig('model', v)}
          options={[
            { value: 'claude-3-opus', label: 'Claude 3 Opus' },
            { value: 'claude-3-sonnet', label: 'Claude 3 Sonnet' },
            { value: 'claude-3-haiku', label: 'Claude 3 Haiku' },
          ]}
          description="Select the Claude model version"
        />

        <ToggleField
          label="Enable Streaming"
          description="Stream responses for better user experience"
          checked={config.streaming}
          onCheckedChange={(checked) => updateConfig('streaming', checked)}
        />
      </CategorySection>
    </div>
  )
}

CompleteExample.meta = {
  description: 'Complete real-world example with all features',
}
