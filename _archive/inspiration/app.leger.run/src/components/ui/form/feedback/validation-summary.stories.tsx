import type { StoryDefault } from '@ladle/react'
import { ValidationSummary } from './validation-summary'

export default {
  title: 'Form Feedback / Validation Summary',
} satisfies StoryDefault

export const AllValid = () => (
  <div className="max-w-md p-8">
    <ValidationSummary
      errorCount={0}
      warningCount={0}
      successCount={10}
      totalFields={10}
    />
  </div>
)

export const SomeErrors = () => (
  <div className="max-w-md p-8">
    <ValidationSummary
      errorCount={3}
      warningCount={0}
      successCount={7}
      totalFields={10}
    />
  </div>
)

export const SomeWarnings = () => (
  <div className="max-w-md p-8">
    <ValidationSummary
      errorCount={0}
      warningCount={2}
      successCount={8}
      totalFields={10}
    />
  </div>
)

export const ErrorsAndWarnings = () => (
  <div className="max-w-md p-8">
    <ValidationSummary
      errorCount={2}
      warningCount={3}
      successCount={5}
      totalFields={10}
    />
  </div>
)

export const EmptyForm = () => (
  <div className="max-w-md p-8">
    <ValidationSummary
      errorCount={0}
      warningCount={0}
      successCount={0}
      totalFields={0}
    />

    <div className="mt-4 p-4 bg-muted rounded-lg">
      <p className="text-sm">
        Empty form state - 0% completion
      </p>
    </div>
  </div>
)

export const PartiallyComplete = () => (
  <div className="max-w-md p-8">
    <ValidationSummary
      errorCount={0}
      warningCount={0}
      successCount={5}
      totalFields={10}
    />

    <div className="mt-4 p-4 bg-muted rounded-lg">
      <p className="text-sm">
        50% complete - 5 out of 10 fields valid
      </p>
    </div>
  </div>
)

export const MostlyComplete = () => (
  <div className="max-w-md p-8">
    <ValidationSummary
      errorCount={0}
      warningCount={1}
      successCount={9}
      totalFields={10}
    />

    <div className="mt-4 p-4 bg-muted rounded-lg">
      <p className="text-sm">
        90% complete - 1 warning remaining
      </p>
    </div>
  </div>
)

export const LargeForm = () => (
  <div className="max-w-md p-8">
    <ValidationSummary
      errorCount={15}
      warningCount={8}
      successCount={27}
      totalFields={50}
    />
  </div>
)

export const ProgressionStates = () => (
  <div className="max-w-md p-8 space-y-6">
    <div>
      <h3 className="text-sm font-medium mb-3">Just Started (0%)</h3>
      <ValidationSummary
        errorCount={0}
        warningCount={0}
        successCount={0}
        totalFields={10}
      />
    </div>

    <div>
      <h3 className="text-sm font-medium mb-3">Some Progress (30%)</h3>
      <ValidationSummary
        errorCount={2}
        warningCount={1}
        successCount={3}
        totalFields={10}
      />
    </div>

    <div>
      <h3 className="text-sm font-medium mb-3">Halfway (50%)</h3>
      <ValidationSummary
        errorCount={1}
        warningCount={2}
        successCount={5}
        totalFields={10}
      />
    </div>

    <div>
      <h3 className="text-sm font-medium mb-3">Almost Done (90%)</h3>
      <ValidationSummary
        errorCount={0}
        warningCount={1}
        successCount={9}
        totalFields={10}
      />
    </div>

    <div>
      <h3 className="text-sm font-medium mb-3">Complete (100%)</h3>
      <ValidationSummary
        errorCount={0}
        warningCount={0}
        successCount={10}
        totalFields={10}
      />
    </div>
  </div>
)

export const InFormContext = () => (
  <div className="max-w-2xl p-8">
    <div className="grid grid-cols-[1fr_300px] gap-6">
      <div className="space-y-6">
        <h2 className="text-2xl font-bold">User Registration</h2>

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Email</label>
            <input
              type="email"
              className="w-full px-3 py-2 border border-green-500 rounded-md"
              defaultValue="user@example.com"
            />
            <p className="text-xs text-green-600">✓ Valid</p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Username</label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-green-500 rounded-md"
              defaultValue="johndoe"
            />
            <p className="text-xs text-green-600">✓ Valid</p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Password</label>
            <input
              type="password"
              className="w-full px-3 py-2 border border-red-500 rounded-md"
              defaultValue="weak"
            />
            <p className="text-xs text-red-600">✗ Too short (minimum 8 characters)</p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Confirm Password</label>
            <input
              type="password"
              className="w-full px-3 py-2 border border-red-500 rounded-md"
              defaultValue=""
            />
            <p className="text-xs text-red-600">✗ Required</p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Phone (Optional)</label>
            <input
              type="tel"
              className="w-full px-3 py-2 border border-yellow-500 rounded-md"
              defaultValue="123-456"
            />
            <p className="text-xs text-yellow-600">⚠ Invalid format</p>
          </div>
        </div>
      </div>

      <aside className="space-y-4">
        <ValidationSummary
          errorCount={2}
          warningCount={1}
          successCount={2}
          totalFields={5}
        />

        <div className="p-4 bg-muted rounded-lg">
          <p className="text-xs text-muted-foreground">
            Fix all errors to continue
          </p>
        </div>
      </aside>
    </div>
  </div>
)

export const StepperForm = () => (
  <div className="max-w-2xl p-8">
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Multi-Step Application</h2>
        <p className="text-muted-foreground">Complete all steps to submit</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="text-center p-4 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200 dark:border-green-800">
          <div className="text-2xl font-bold text-green-600 mb-1">✓</div>
          <div className="text-sm font-medium">Step 1</div>
          <div className="text-xs text-muted-foreground">Personal Info</div>
        </div>

        <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-950 rounded-lg border border-yellow-200 dark:border-yellow-800">
          <div className="text-2xl font-bold text-yellow-600 mb-1">⚠</div>
          <div className="text-sm font-medium">Step 2</div>
          <div className="text-xs text-muted-foreground">Company Details</div>
        </div>

        <div className="text-center p-4 bg-muted rounded-lg border">
          <div className="text-2xl font-bold text-muted-foreground mb-1">○</div>
          <div className="text-sm font-medium">Step 3</div>
          <div className="text-xs text-muted-foreground">Verification</div>
        </div>
      </div>

      <ValidationSummary
        errorCount={0}
        warningCount={2}
        successCount={8}
        totalFields={15}
      />

      <div className="flex justify-between">
        <button className="px-4 py-2 border rounded-md">Previous</button>
        <button className="px-4 py-2 bg-primary text-primary-foreground rounded-md">
          Next Step
        </button>
      </div>
    </div>
  </div>
)

export const RealWorldSettingsForm = () => (
  <div className="max-w-2xl p-8">
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Account Settings</h2>
        <p className="text-muted-foreground">Manage your account preferences</p>
      </div>

      <ValidationSummary
        errorCount={1}
        warningCount={2}
        successCount={12}
        totalFields={15}
      />

      <div className="grid grid-cols-2 gap-6">
        <div>
          <h3 className="font-semibold mb-3">Profile</h3>
          <div className="space-y-3 text-sm">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 bg-green-500 rounded-full" />
              <span>Name</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 bg-green-500 rounded-full" />
              <span>Email</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 bg-yellow-500 rounded-full" />
              <span>Avatar (Optional)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 bg-green-500 rounded-full" />
              <span>Bio</span>
            </div>
          </div>
        </div>

        <div>
          <h3 className="font-semibold mb-3">Security</h3>
          <div className="space-y-3 text-sm">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 bg-red-500 rounded-full" />
              <span>Current Password</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 bg-green-500 rounded-full" />
              <span>Two-Factor Auth</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 bg-green-500 rounded-full" />
              <span>Recovery Email</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 bg-yellow-500 rounded-full" />
              <span>Backup Codes (Suggested)</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <button className="px-4 py-2 border rounded-md">Cancel</button>
        <button className="px-4 py-2 bg-primary text-primary-foreground rounded-md" disabled>
          Save Changes (Fix errors first)
        </button>
      </div>
    </div>
  </div>
)

export const CustomClassName = () => (
  <div className="max-w-md p-8">
    <ValidationSummary
      errorCount={2}
      warningCount={1}
      successCount={7}
      totalFields={10}
      className="shadow-lg"
    />
  </div>
)
