import type { StoryDefault} from '@ladle/react'
import { FieldStatusIndicator } from './field-status-indicator'

export default {
  title: 'Form Feedback / Field Status Indicator',
} satisfies StoryDefault

export const Valid = () => (
  <div className="max-w-md p-8">
    <FieldStatusIndicator status="valid" />

    <div className="mt-4 p-4 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg">
      <p className="text-sm text-green-900 dark:text-green-100">
        ✓ Shows a green checkmark when field is valid
      </p>
    </div>
  </div>
)

export const Error = () => (
  <div className="max-w-md p-8">
    <FieldStatusIndicator status="error" />

    <div className="mt-4 p-4 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg">
      <p className="text-sm text-red-900 dark:text-red-100">
        ✗ Shows a red X when field has an error
      </p>
    </div>
  </div>
)

export const Warning = () => (
  <div className="max-w-md p-8">
    <FieldStatusIndicator status="warning" />

    <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-lg">
      <p className="text-sm text-yellow-900 dark:text-yellow-100">
        ⚠ Shows a yellow warning triangle for warnings
      </p>
    </div>
  </div>
)

export const Validating = () => (
  <div className="max-w-md p-8">
    <FieldStatusIndicator status="validating" />

    <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg">
      <p className="text-sm text-blue-900 dark:text-blue-100">
        ⏳ Shows a spinning loader while validating
      </p>
    </div>
  </div>
)

export const Idle = () => (
  <div className="max-w-md p-8">
    <FieldStatusIndicator status="idle" />

    <div className="mt-4 p-4 bg-muted rounded-lg">
      <p className="text-sm">
        Idle status returns null (no indicator shown)
      </p>
    </div>
  </div>
)

export const AllStates = () => (
  <div className="max-w-md p-8 space-y-6">
    <div className="flex items-center gap-3">
      <FieldStatusIndicator status="valid" />
      <span className="text-sm">Valid</span>
    </div>

    <div className="flex items-center gap-3">
      <FieldStatusIndicator status="error" />
      <span className="text-sm">Error</span>
    </div>

    <div className="flex items-center gap-3">
      <FieldStatusIndicator status="warning" />
      <span className="text-sm">Warning</span>
    </div>

    <div className="flex items-center gap-3">
      <FieldStatusIndicator status="validating" />
      <span className="text-sm">Validating...</span>
    </div>

    <div className="flex items-center gap-3">
      <FieldStatusIndicator status="idle" />
      <span className="text-sm">Idle (no indicator)</span>
    </div>
  </div>
)

export const SmallSize = () => (
  <div className="max-w-md p-8 space-y-4">
    <div className="flex items-center gap-3">
      <FieldStatusIndicator status="valid" size="sm" />
      <span className="text-sm">Valid (Small)</span>
    </div>

    <div className="flex items-center gap-3">
      <FieldStatusIndicator status="error" size="sm" />
      <span className="text-sm">Error (Small)</span>
    </div>

    <div className="flex items-center gap-3">
      <FieldStatusIndicator status="warning" size="sm" />
      <span className="text-sm">Warning (Small)</span>
    </div>
  </div>
)

export const MediumSize = () => (
  <div className="max-w-md p-8 space-y-4">
    <div className="flex items-center gap-3">
      <FieldStatusIndicator status="valid" size="md" />
      <span className="text-sm">Valid (Medium)</span>
    </div>

    <div className="flex items-center gap-3">
      <FieldStatusIndicator status="error" size="md" />
      <span className="text-sm">Error (Medium)</span>
    </div>

    <div className="flex items-center gap-3">
      <FieldStatusIndicator status="warning" size="md" />
      <span className="text-sm">Warning (Medium)</span>
    </div>
  </div>
)

export const LargeSize = () => (
  <div className="max-w-md p-8 space-y-4">
    <div className="flex items-center gap-3">
      <FieldStatusIndicator status="valid" size="lg" />
      <span className="text-sm">Valid (Large)</span>
    </div>

    <div className="flex items-center gap-3">
      <FieldStatusIndicator status="error" size="lg" />
      <span className="text-sm">Error (Large)</span>
    </div>

    <div className="flex items-center gap-3">
      <FieldStatusIndicator status="warning" size="lg" />
      <span className="text-sm">Warning (Large)</span>
    </div>
  </div>
)

export const WithLabels = () => (
  <div className="max-w-md p-8 space-y-4">
    <FieldStatusIndicator status="valid" showLabel={true} />
    <FieldStatusIndicator status="error" showLabel={true} />
    <FieldStatusIndicator status="warning" showLabel={true} />
    <FieldStatusIndicator status="validating" showLabel={true} />
  </div>
)

export const WithLabelsLarge = () => (
  <div className="max-w-md p-8 space-y-4">
    <FieldStatusIndicator status="valid" showLabel={true} size="lg" />
    <FieldStatusIndicator status="error" showLabel={true} size="lg" />
    <FieldStatusIndicator status="warning" showLabel={true} size="lg" />
    <FieldStatusIndicator status="validating" showLabel={true} size="lg" />
  </div>
)

export const InFormContext = () => (
  <div className="max-w-md p-8">
    <div className="space-y-4">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium">Email Address</label>
          <FieldStatusIndicator status="valid" />
        </div>
        <input
          type="email"
          className="w-full px-3 py-2 border border-green-500 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          defaultValue="user@example.com"
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium">Username</label>
          <FieldStatusIndicator status="error" />
        </div>
        <input
          type="text"
          className="w-full px-3 py-2 border border-red-500 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
          defaultValue="invalid username!"
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium">Password</label>
          <FieldStatusIndicator status="warning" />
        </div>
        <input
          type="password"
          className="w-full px-3 py-2 border border-yellow-500 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
          defaultValue="weak"
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium">Phone Number</label>
          <FieldStatusIndicator status="validating" />
        </div>
        <input
          type="tel"
          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
          defaultValue="+1 234 567 8900"
        />
      </div>
    </div>
  </div>
)

export const AsyncValidation = () => (
  <div className="max-w-md p-8">
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium">Check Username Availability</label>
          <FieldStatusIndicator status="validating" showLabel />
        </div>
        <input
          type="text"
          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
          defaultValue="checking..."
        />
        <p className="text-xs text-muted-foreground">Checking availability...</p>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium">Username Available</label>
          <FieldStatusIndicator status="valid" showLabel />
        </div>
        <input
          type="text"
          className="w-full px-3 py-2 border border-green-500 rounded-md"
          defaultValue="johndoe"
        />
        <p className="text-xs text-green-600">✓ Username is available</p>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium">Username Taken</label>
          <FieldStatusIndicator status="error" showLabel />
        </div>
        <input
          type="text"
          className="w-full px-3 py-2 border border-red-500 rounded-md"
          defaultValue="admin"
        />
        <p className="text-xs text-red-600">✗ Username is already taken</p>
      </div>
    </div>
  </div>
)

export const RealWorldValidation = () => (
  <div className="max-w-md p-8">
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Sign Up Form</h2>

      <div className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Full Name</label>
            <FieldStatusIndicator status="valid" size="sm" />
          </div>
          <input
            type="text"
            className="w-full px-3 py-2 border border-green-500 rounded-md"
            defaultValue="Jane Doe"
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Email</label>
            <FieldStatusIndicator status="validating" size="sm" />
          </div>
          <input
            type="email"
            className="w-full px-3 py-2 border rounded-md"
            defaultValue="jane@example.com"
          />
          <p className="text-xs text-blue-600">Verifying email...</p>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Password</label>
            <FieldStatusIndicator status="warning" size="sm" />
          </div>
          <input
            type="password"
            className="w-full px-3 py-2 border border-yellow-500 rounded-md"
            defaultValue="pass123"
          />
          <p className="text-xs text-yellow-600">⚠ Password is weak - consider adding special characters</p>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Confirm Password</label>
            <FieldStatusIndicator status="error" size="sm" />
          </div>
          <input
            type="password"
            className="w-full px-3 py-2 border border-red-500 rounded-md"
            defaultValue="different"
          />
          <p className="text-xs text-red-600">✗ Passwords do not match</p>
        </div>
      </div>
    </div>
  </div>
)
