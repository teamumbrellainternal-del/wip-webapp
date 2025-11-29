import type { StoryDefault } from '@ladle/react'
import { ExportReadinessIndicator } from './export-readiness-indicator'

export default {
  title: 'Form Feedback / Export Readiness Indicator',
} satisfies StoryDefault

export const ReadyForExport = () => {
  const handleExport = () => {
    alert('Exporting configuration...')
    console.log('Export triggered')
  }

  return (
    <div className="max-w-2xl p-8">
      <ExportReadinessIndicator
        _isReady={true}
        onExport={handleExport}
      />

      <div className="mt-6 p-4 bg-muted rounded-lg">
        <p className="text-sm font-medium mb-2">Usage:</p>
        <p className="text-xs text-muted-foreground">
          Shows a green success state when configuration is valid with no errors or warnings
        </p>
      </div>
    </div>
  )
}

export const ReadyWithWarnings = () => {
  const handleExport = () => {
    alert('Exporting with warnings...')
    console.log('Export triggered (with warnings)')
  }

  return (
    <div className="max-w-2xl p-8">
      <ExportReadinessIndicator
        _isReady={true}
        warnings={[
          { field: 'timeout', message: 'Timeout value is higher than recommended (30s)' },
          { field: 'retries', message: 'Consider reducing retry count in production' },
        ]}
        onExport={handleExport}
      />

      <div className="mt-6 p-4 bg-muted rounded-lg">
        <p className="text-sm font-medium mb-2">Usage:</p>
        <p className="text-xs text-muted-foreground">
          Shows a yellow warning state when configuration is valid but has non-critical issues
        </p>
      </div>
    </div>
  )
}

export const NotReadyWithErrors = () => {
  const handleExport = () => {
    alert('Cannot export - fix errors first')
  }

  return (
    <div className="max-w-2xl p-8">
      <ExportReadinessIndicator
        _isReady={false}
        errors={[
          { field: 'apiKey', message: 'API key is required' },
          { field: 'endpoint', message: 'Endpoint URL must be a valid HTTPS URL' },
          { field: 'timeout', message: 'Timeout must be between 1 and 300 seconds' },
        ]}
        onExport={handleExport}
      />

      <div className="mt-6 p-4 bg-muted rounded-lg">
        <p className="text-sm font-medium mb-2">Usage:</p>
        <p className="text-xs text-muted-foreground">
          Shows a red error state when configuration has critical issues. Export button is disabled.
        </p>
      </div>
    </div>
  )
}

export const ManyErrors = () => {
  const handleExport = () => {
    alert('Cannot export - fix errors first')
  }

  return (
    <div className="max-w-2xl p-8">
      <ExportReadinessIndicator
        _isReady={false}
        errors={[
          { field: 'name', message: 'Name is required' },
          { field: 'email', message: 'Email must be a valid email address' },
          { field: 'password', message: 'Password must be at least 8 characters' },
          { field: 'confirmPassword', message: 'Passwords do not match' },
          { field: 'age', message: 'Age must be 18 or older' },
          { field: 'phone', message: 'Phone number is invalid' },
          { field: 'address', message: 'Address is required' },
        ]}
        onExport={handleExport}
      />

      <div className="mt-6 p-4 bg-muted rounded-lg">
        <p className="text-sm font-medium mb-2">Behavior:</p>
        <p className="text-xs text-muted-foreground">
          Only first 3 errors are shown, with a count of remaining errors ("...and 4 more")
        </p>
      </div>
    </div>
  )
}

export const ManyWarnings = () => {
  const handleExport = () => {
    alert('Exporting with warnings...')
  }

  return (
    <div className="max-w-2xl p-8">
      <ExportReadinessIndicator
        _isReady={true}
        warnings={[
          { field: 'cache', message: 'Cache TTL is very high (24 hours)' },
          { field: 'logging', message: 'Verbose logging enabled - may impact performance' },
          { field: 'cors', message: 'CORS is set to allow all origins' },
          { field: 'rateLimit', message: 'Rate limit is disabled' },
          { field: 'compression', message: 'Response compression is disabled' },
        ]}
        onExport={handleExport}
      />

      <div className="mt-6 p-4 bg-muted rounded-lg">
        <p className="text-sm font-medium mb-2">Behavior:</p>
        <p className="text-xs text-muted-foreground">
          Only first 3 warnings are shown, with a count of remaining warnings
        </p>
      </div>
    </div>
  )
}

export const WithSuggestions = () => {
  const handleExport = () => {
    alert('Exporting configuration...')
  }

  return (
    <div className="max-w-2xl p-8">
      <ExportReadinessIndicator
        _isReady={true}
        suggestions={[
          { message: 'Consider enabling SSL certificate validation for production' },
          { message: 'Add request timeout to prevent hanging connections' },
          { message: 'Enable response caching to improve performance' },
        ]}
        onExport={handleExport}
      />

      <div className="mt-6 p-4 bg-muted rounded-lg">
        <p className="text-sm font-medium mb-2">Usage:</p>
        <p className="text-xs text-muted-foreground">
          Suggestions are non-critical optional improvements shown in blue
        </p>
      </div>
    </div>
  )
}

export const WarningsAndSuggestions = () => {
  const handleExport = () => {
    alert('Exporting with warnings...')
  }

  return (
    <div className="max-w-2xl p-8">
      <ExportReadinessIndicator
        _isReady={true}
        warnings={[
          { field: 'timeout', message: 'Timeout is set very low (1s)' },
          { field: 'maxConnections', message: 'Max connections is very high (1000)' },
        ]}
        suggestions={[
          { message: 'Consider adding retry logic for failed requests' },
          { message: 'Enable request logging for debugging' },
        ]}
        onExport={handleExport}
      />

      <div className="mt-6 p-4 bg-muted rounded-lg">
        <p className="text-sm font-medium mb-2">Combined Display:</p>
        <p className="text-xs text-muted-foreground">
          Warnings are shown first, followed by suggestions
        </p>
      </div>
    </div>
  )
}

export const ErrorsWithSuggestions = () => {
  const handleExport = () => {
    alert('Cannot export - fix errors first')
  }

  return (
    <div className="max-w-2xl p-8">
      <ExportReadinessIndicator
        _isReady={false}
        errors={[
          { field: 'apiKey', message: 'API key is required' },
          { field: 'region', message: 'Region must be selected' },
        ]}
        suggestions={[
          { message: 'You can generate an API key from your account settings' },
          { message: 'Choose the region closest to your users for best performance' },
        ]}
        onExport={handleExport}
      />

      <div className="mt-6 p-4 bg-muted rounded-lg">
        <p className="text-sm font-medium mb-2">Note:</p>
        <p className="text-xs text-muted-foreground">
          Suggestions are hidden when there are errors - only errors are shown
        </p>
      </div>
    </div>
  )
}

export const WithoutExportButton = () => {
  return (
    <div className="max-w-2xl p-8">
      <ExportReadinessIndicator
        _isReady={true}
      />

      <div className="mt-6 p-4 bg-muted rounded-lg">
        <p className="text-sm font-medium mb-2">Usage:</p>
        <p className="text-xs text-muted-foreground">
          When `onExport` handler is not provided, no export button is shown
        </p>
      </div>
    </div>
  )
}

export const ReadyWithoutCallback = () => {
  return (
    <div className="max-w-2xl p-8">
      <ExportReadinessIndicator
        _isReady={true}
      />

      <p className="mt-4 text-sm text-muted-foreground">
        Use this variant for status display only, without export functionality
      </p>
    </div>
  )
}

export const ErrorsWithoutCallback = () => {
  return (
    <div className="max-w-2xl p-8">
      <ExportReadinessIndicator
        _isReady={false}
        errors={[
          { field: 'config', message: 'Configuration is invalid' },
        ]}
      />

      <p className="mt-4 text-sm text-muted-foreground">
        Status-only display without export button
      </p>
    </div>
  )
}

export const RealWorldFormValidation = () => {
  const handleExport = () => {
    alert('Exporting release configuration...')
    console.log('Exporting...')
  }

  return (
    <div className="max-w-2xl p-8">
      <div className="mb-6 space-y-4">
        <h2 className="text-xl font-semibold">Release Configuration</h2>
        <p className="text-sm text-muted-foreground">
          Configure your deployment settings below. The export readiness indicator
          will show validation status.
        </p>
      </div>

      <ExportReadinessIndicator
        _isReady={false}
        errors={[
          { field: 'name', message: 'Release name is required' },
          { field: 'gitUrl', message: 'Git repository URL is required' },
        ]}
        warnings={[
          { field: 'branch', message: 'Using "main" branch - ensure this is intentional for production' },
        ]}
        suggestions={[
          { message: 'Add a description to help your team understand this release' },
          { message: 'Consider adding environment-specific configurations' },
        ]}
        onExport={handleExport}
      />

      <div className="mt-6 p-4 bg-muted rounded-lg">
        <p className="text-sm font-medium mb-2">Real-World Example:</p>
        <p className="text-xs text-muted-foreground">
          This demonstrates how the component might be used in a form to provide
          comprehensive validation feedback before allowing export/save.
        </p>
      </div>
    </div>
  )
}

export const ProgressiveValidation = () => {
  const handleExport = () => {
    alert('Configuration exported successfully!')
  }

  return (
    <div className="max-w-2xl p-8 space-y-6">
      <div>
        <h3 className="font-medium mb-2">Stage 1: Critical Errors</h3>
        <ExportReadinessIndicator
          _isReady={false}
          errors={[
            { field: 'apiKey', message: 'API key is required' },
            { field: 'endpoint', message: 'Endpoint URL is required' },
          ]}
          onExport={handleExport}
        />
      </div>

      <div>
        <h3 className="font-medium mb-2">Stage 2: Warnings Remain</h3>
        <ExportReadinessIndicator
          _isReady={true}
          warnings={[
            { field: 'timeout', message: 'Timeout value is very low' },
          ]}
          onExport={handleExport}
        />
      </div>

      <div>
        <h3 className="font-medium mb-2">Stage 3: Ready to Export</h3>
        <ExportReadinessIndicator
          _isReady={true}
          onExport={handleExport}
        />
      </div>

      <div className="p-4 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg">
        <p className="text-sm text-blue-900 dark:text-blue-100">
          This demonstrates the progressive validation states as a user fixes issues in a form
        </p>
      </div>
    </div>
  )
}
