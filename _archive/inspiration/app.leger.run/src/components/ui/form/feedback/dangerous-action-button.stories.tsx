import type { StoryDefault } from '@ladle/react'
import { DangerousActionButton } from './dangerous-action-button'
import { Trash2, AlertTriangle, XCircle } from 'lucide-react'

export default {
  title: 'Form Feedback / Dangerous Action Button',
} satisfies StoryDefault

export const Basic = () => (
  <div className="max-w-md p-8">
    <DangerousActionButton>Delete</DangerousActionButton>
  </div>
)

export const WithIcon = () => (
  <div className="max-w-md p-8 space-y-4">
    <DangerousActionButton>
      <Trash2 className="h-4 w-4 mr-2" />
      Delete Account
    </DangerousActionButton>

    <DangerousActionButton>
      <XCircle className="h-4 w-4 mr-2" />
      Cancel Subscription
    </DangerousActionButton>

    <DangerousActionButton>
      <AlertTriangle className="h-4 w-4 mr-2" />
      Reset All Data
    </DangerousActionButton>
  </div>
)

export const DeleteVariations = () => (
  <div className="max-w-md p-8 space-y-4">
    <DangerousActionButton>Delete</DangerousActionButton>
    <DangerousActionButton>Delete Forever</DangerousActionButton>
    <DangerousActionButton>Remove</DangerousActionButton>
    <DangerousActionButton>Permanently Delete</DangerousActionButton>
  </div>
)

export const Disabled = () => (
  <div className="max-w-md p-8">
    <DangerousActionButton disabled>
      Delete Account
    </DangerousActionButton>

    <div className="mt-4 p-4 bg-muted rounded-lg">
      <p className="text-sm">
        Disabled state - typically used when action cannot be performed
      </p>
    </div>
  </div>
)

export const Sizes = () => (
  <div className="max-w-md p-8 space-y-4">
    <DangerousActionButton size="sm">
      Delete (Small)
    </DangerousActionButton>

    <DangerousActionButton size="default">
      Delete (Default)
    </DangerousActionButton>

    <DangerousActionButton size="lg">
      Delete (Large)
    </DangerousActionButton>
  </div>
)

export const FullWidth = () => (
  <div className="max-w-md p-8">
    <DangerousActionButton className="w-full">
      Delete All Data
    </DangerousActionButton>
  </div>
)

export const InFormContext = () => (
  <div className="max-w-md p-8">
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-4">Manage Account</h2>
        <p className="text-sm text-muted-foreground mb-6">
          Once you delete your account, there is no going back. Please be certain.
        </p>
      </div>

      <div className="space-y-4 p-4 border border-destructive rounded-lg">
        <div>
          <h3 className="font-medium text-destructive mb-2">Danger Zone</h3>
          <p className="text-sm text-muted-foreground">
            Irreversible and destructive actions
          </p>
        </div>

        <DangerousActionButton className="w-full">
          <Trash2 className="h-4 w-4 mr-2" />
          Delete Account
        </DangerousActionButton>
      </div>
    </div>
  </div>
)

export const WithConfirmationDialog = () => {
  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this item? This action cannot be undone.')) {
      alert('Item deleted')
      console.log('Deleted')
    }
  }

  return (
    <div className="max-w-md p-8">
      <DangerousActionButton onClick={handleDelete}>
        <Trash2 className="h-4 w-4 mr-2" />
        Delete Item
      </DangerousActionButton>

      <div className="mt-4 p-4 bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-lg">
        <p className="text-sm text-amber-900 dark:text-amber-100">
          💡 Click the button to see confirmation dialog
        </p>
      </div>
    </div>
  )
}

export const RealWorldExamples = () => (
  <div className="max-w-md p-8 space-y-8">
    <div className="space-y-4">
      <h3 className="font-semibold">User Management</h3>
      <div className="flex justify-between items-center p-4 border rounded-lg">
        <div>
          <p className="font-medium">John Doe</p>
          <p className="text-sm text-muted-foreground">john@example.com</p>
        </div>
        <DangerousActionButton size="sm">
          Remove
        </DangerousActionButton>
      </div>
    </div>

    <div className="space-y-4">
      <h3 className="font-semibold">Project Settings</h3>
      <div className="p-4 border rounded-lg space-y-4">
        <div>
          <p className="font-medium">Delete Project</p>
          <p className="text-sm text-muted-foreground">
            Permanently delete this project and all of its data
          </p>
        </div>
        <DangerousActionButton>
          <Trash2 className="h-4 w-4 mr-2" />
          Delete Project
        </DangerousActionButton>
      </div>
    </div>

    <div className="space-y-4">
      <h3 className="font-semibold">API Key Management</h3>
      <div className="space-y-3">
        <div className="flex justify-between items-center p-3 border rounded">
          <code className="text-sm">sk_live_***************</code>
          <DangerousActionButton size="sm">
            <XCircle className="h-3 w-3 mr-1" />
            Revoke
          </DangerousActionButton>
        </div>
        <div className="flex justify-between items-center p-3 border rounded">
          <code className="text-sm">sk_test_***************</code>
          <DangerousActionButton size="sm">
            <XCircle className="h-3 w-3 mr-1" />
            Revoke
          </DangerousActionButton>
        </div>
      </div>
    </div>
  </div>
)

export const DangerZoneSection = () => (
  <div className="max-w-2xl p-8">
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Settings</h2>
        <p className="text-muted-foreground">Manage your account and preferences</p>
      </div>

      {/* Regular settings */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Profile</h3>
        <div className="space-y-2">
          <label className="text-sm font-medium">Display Name</label>
          <input
            type="text"
            className="w-full px-3 py-2 border rounded-md"
            defaultValue="Jane Smith"
          />
        </div>
        <button className="px-4 py-2 bg-primary text-primary-foreground rounded-md">
          Save Changes
        </button>
      </div>

      {/* Danger zone */}
      <div className="mt-8 p-6 border-2 border-destructive/50 bg-destructive/5 rounded-lg space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-destructive flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Danger Zone
          </h3>
          <p className="text-sm text-muted-foreground mt-2">
            These actions are permanent and cannot be undone
          </p>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between p-4 bg-background rounded border">
            <div>
              <p className="font-medium">Delete all data</p>
              <p className="text-sm text-muted-foreground">Remove all your data from our servers</p>
            </div>
            <DangerousActionButton>
              Delete Data
            </DangerousActionButton>
          </div>

          <div className="flex items-center justify-between p-4 bg-background rounded border">
            <div>
              <p className="font-medium">Delete account</p>
              <p className="text-sm text-muted-foreground">Permanently delete your account</p>
            </div>
            <DangerousActionButton>
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Account
            </DangerousActionButton>
          </div>
        </div>
      </div>
    </div>
  </div>
)
