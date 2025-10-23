import type { StoryDefault } from '@ladle/react'
import { EnvironmentVariableForm } from './environment-variable-form'

export default {
  title: 'Domain / Environment Variable Form',
} satisfies StoryDefault

export const CreateNew = () => {
  const handleSubmit = (data: any) => {
    console.log('Creating new environment variable:', data)
    alert(`Created: ${JSON.stringify(data, null, 2)}`)
  }

  const handleCancel = () => {
    console.log('Cancelled')
    alert('Cancelled')
  }

  return (
    <div className="max-w-2xl p-8">
      <EnvironmentVariableForm
        onSubmit={handleSubmit}
        onCancel={handleCancel}
      />
    </div>
  )
}

export const EditExisting = () => {
  const handleSubmit = (data: any) => {
    console.log('Updating environment variable:', data)
    alert(`Updated: ${JSON.stringify(data, null, 2)}`)
  }

  const handleCancel = () => {
    console.log('Cancelled')
    alert('Cancelled')
  }

  return (
    <div className="max-w-2xl p-8">
      <EnvironmentVariableForm
        isEditing={true}
        initialData={{
          key: 'DATABASE_URL',
          value: 'postgresql://localhost:5432/mydb',
          isSensitive: false,
          environment: 'production',
        }}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
      />
    </div>
  )
}

export const SensitiveValue = () => {
  const handleSubmit = (data: any) => {
    console.log('Creating sensitive environment variable:', data)
    alert(`Created: ${JSON.stringify({ ...data, value: '***' }, null, 2)}`)
  }

  const handleCancel = () => {
    console.log('Cancelled')
  }

  return (
    <div className="max-w-2xl p-8">
      <EnvironmentVariableForm
        initialData={{
          key: 'API_SECRET_KEY',
          value: 'sk_test_1234567890abcdef',
          isSensitive: true,
          environment: 'all',
        }}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
      />

      <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg">
        <p className="text-sm text-blue-900 dark:text-blue-100">
          💡 <strong>Tip:</strong> Toggle the "Sensitive" switch to enable/disable password masking and the visibility toggle button
        </p>
      </div>
    </div>
  )
}

export const WithNote = () => {
  const handleSubmit = (data: any) => {
    console.log('Creating environment variable with note:', data)
    alert(`Created: ${JSON.stringify(data, null, 2)}`)
  }

  const handleCancel = () => {
    console.log('Cancelled')
  }

  return (
    <div className="max-w-2xl p-8">
      <EnvironmentVariableForm
        initialData={{
          key: 'STRIPE_PUBLISHABLE_KEY',
          value: 'pk_test_...',
          isSensitive: false,
          environment: 'production',
          note: 'This key is safe to expose on the client side. Used for Stripe checkout integration.',
        }}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
      />
    </div>
  )
}

export const ProductionEnvironment = () => {
  const handleSubmit = (data: any) => {
    console.log('Creating production environment variable:', data)
    alert(`Created: ${JSON.stringify(data, null, 2)}`)
  }

  const handleCancel = () => {
    console.log('Cancelled')
  }

  return (
    <div className="max-w-2xl p-8">
      <EnvironmentVariableForm
        initialData={{
          key: 'NEXT_PUBLIC_APP_URL',
          value: 'https://myapp.com',
          isSensitive: false,
          environment: 'production',
        }}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
      />
    </div>
  )
}

export const PreviewEnvironmentWithBranch = () => {
  const handleSubmit = (data: any) => {
    console.log('Creating preview environment variable:', data)
    alert(`Created: ${JSON.stringify(data, null, 2)}`)
  }

  const handleCancel = () => {
    console.log('Cancelled')
  }

  return (
    <div className="max-w-2xl p-8">
      <EnvironmentVariableForm
        initialData={{
          key: 'PREVIEW_MODE',
          value: 'true',
          isSensitive: false,
          environment: 'preview',
        }}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
      />

      <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg">
        <p className="text-sm text-blue-900 dark:text-blue-100">
          💡 <strong>Conditional Field:</strong> When "Preview" environment is selected, a "Branch" selector appears below
        </p>
      </div>
    </div>
  )
}

export const DevelopmentEnvironment = () => {
  const handleSubmit = (data: any) => {
    console.log('Creating development environment variable:', data)
    alert(`Created: ${JSON.stringify(data, null, 2)}`)
  }

  const handleCancel = () => {
    console.log('Cancelled')
  }

  return (
    <div className="max-w-2xl p-8">
      <EnvironmentVariableForm
        initialData={{
          key: 'DEBUG',
          value: 'true',
          isSensitive: false,
          environment: 'development',
        }}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
      />
    </div>
  )
}

export const AllEnvironments = () => {
  const handleSubmit = (data: any) => {
    console.log('Creating environment variable for all environments:', data)
    alert(`Created: ${JSON.stringify(data, null, 2)}`)
  }

  const handleCancel = () => {
    console.log('Cancelled')
  }

  return (
    <div className="max-w-2xl p-8">
      <EnvironmentVariableForm
        initialData={{
          key: 'NODE_ENV',
          value: 'production',
          isSensitive: false,
          environment: 'all',
        }}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
      />
    </div>
  )
}

export const ReadOnlyKeyWhenEditing = () => {
  const handleSubmit = (data: any) => {
    console.log('Updating environment variable:', data)
    alert(`Updated: ${JSON.stringify(data, null, 2)}`)
  }

  const handleCancel = () => {
    console.log('Cancelled')
  }

  return (
    <div className="max-w-2xl p-8">
      <EnvironmentVariableForm
        isEditing={true}
        initialData={{
          key: 'IMMUTABLE_KEY',
          value: 'new-value',
          isSensitive: false,
          environment: 'production',
        }}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
      />

      <div className="mt-4 p-4 bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-lg">
        <p className="text-sm text-amber-900 dark:text-amber-100">
          ⚠️ <strong>Note:</strong> When editing, the "Name" field is read-only (grayed out) to prevent changing the variable key
        </p>
      </div>
    </div>
  )
}

export const CompleteExample = () => {
  const handleSubmit = (data: any) => {
    console.log('Complete example submission:', data)
    alert(`Submitted: ${JSON.stringify(data, null, 2)}`)
  }

  const handleCancel = () => {
    console.log('Cancelled')
    alert('Cancelled - no changes saved')
  }

  return (
    <div className="max-w-2xl p-8">
      <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg">
        <h3 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
          Interactive Demo
        </h3>
        <ul className="text-sm text-blue-900 dark:text-blue-100 space-y-1 list-disc list-inside">
          <li>Fill out all fields to see the complete form</li>
          <li>Toggle "Sensitive" to see password masking and visibility controls</li>
          <li>Select "Preview" environment to reveal the conditional branch selector</li>
          <li>Click "Add Note" to attach documentation to this variable</li>
          <li>Click "Create" to see the submitted JSON in an alert</li>
        </ul>
      </div>

      <EnvironmentVariableForm
        onSubmit={handleSubmit}
        onCancel={handleCancel}
      />
    </div>
  )
}
