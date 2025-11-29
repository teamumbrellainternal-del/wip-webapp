// src/components/ui/form/fields/array-field.stories.tsx
import type { Story } from '@ladle/react'
import { ArrayField } from './array-field'
import { useState } from 'react'

export default {
  title: 'Form Fields / ArrayField',
}

export const Basic: Story = () => {
  const [values, setValues] = useState<string[]>([])
  
  return (
    <div className="max-w-md p-8">
      <ArrayField
        label="API Endpoints"
        description="Add multiple API endpoints for your service"
        values={values}
        onChange={setValues}
        placeholder="https://api.example.com"
      />
    </div>
  )
}

Basic.meta = {
  description: 'Basic array field for managing lists of strings',
}

export const WithInitialValues: Story = () => {
  const [values, setValues] = useState<string[]>([
    'https://api.openai.com',
    'https://api.anthropic.com',
    'https://api.cohere.ai'
  ])
  
  return (
    <div className="max-w-md p-8">
      <ArrayField
        label="Allowed Domains"
        description="Domains that can access this service"
        values={values}
        onChange={setValues}
        placeholder="example.com"
      />
    </div>
  )
}

WithInitialValues.meta = {
  description: 'Array field with pre-populated values',
}

export const WithMaxItems: Story = () => {
  const [values, setValues] = useState<string[]>(['admin@example.com'])
  
  return (
    <div className="max-w-md p-8">
      <ArrayField
        label="Admin Emails"
        description="Maximum 5 admin email addresses"
        values={values}
        onChange={setValues}
        placeholder="admin@example.com"
        maxItems={5}
      />
    </div>
  )
}

WithMaxItems.meta = {
  description: 'Array field with maximum item limit',
}

export const CustomAddButton: Story = () => {
  const [values, setValues] = useState<string[]>([])
  
  return (
    <div className="max-w-md p-8">
      <ArrayField
        label="Environment Variables"
        description="Press Enter to add, or click the + button"
        values={values}
        onChange={setValues}
        placeholder="VARIABLE_NAME"
        addButtonText="Add Variable"
      />
    </div>
  )
}
