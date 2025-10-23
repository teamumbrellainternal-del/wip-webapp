import type { StoryDefault } from '@ladle/react'
import { useState } from 'react'
import { SaveButton } from './save-button'

export default {
  title: 'Form Feedback / Save Button',
} satisfies StoryDefault

export const Pristine = () => (
  <div className="max-w-md p-8">
    <SaveButton isDirty={false} isLoading={false} />

    <div className="mt-4 p-4 bg-muted rounded-lg">
      <p className="text-sm font-medium mb-2">Disabled State (Pristine)</p>
      <p className="text-xs text-muted-foreground">
        Button is disabled when form is not dirty (no changes made)
      </p>
    </div>
  </div>
)

export const Dirty = () => (
  <div className="max-w-md p-8">
    <SaveButton isDirty={true} isLoading={false} />

    <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg">
      <p className="text-sm font-medium mb-2 text-blue-900 dark:text-blue-100">
        Enabled State (Dirty)
      </p>
      <p className="text-xs text-blue-900 dark:text-blue-100">
        Button is enabled when form has unsaved changes
      </p>
    </div>
  </div>
)

export const Loading = () => (
  <div className="max-w-md p-8">
    <SaveButton isDirty={true} isLoading={true} />

    <div className="mt-4 p-4 bg-muted rounded-lg">
      <p className="text-sm font-medium mb-2">Loading State</p>
      <p className="text-xs text-muted-foreground">
        Shows spinner and disables button while saving
      </p>
    </div>
  </div>
)

export const CustomText = () => (
  <div className="max-w-md p-8 space-y-4">
    <SaveButton isDirty={true} isLoading={false} saveText="Update Profile" />
    <SaveButton isDirty={true} isLoading={false} saveText="Publish Changes" />
    <SaveButton isDirty={true} isLoading={true} saveText="Uploading..." />
  </div>
)

export const DifferentVariants = () => (
  <div className="max-w-md p-8 space-y-4">
    <SaveButton isDirty={true} isLoading={false} variant="default" saveText="Save (Default)" />
    <SaveButton isDirty={true} isLoading={false} variant="secondary" saveText="Save (Secondary)" />
    <SaveButton isDirty={true} isLoading={false} variant="outline" saveText="Save (Outline)" />
  </div>
)

export const Interactive = () => {
  const [isDirty, setIsDirty] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [name, setName] = useState('John Doe')
  const [savedName, setSavedName] = useState('John Doe')

  const handleSave = () => {
    setIsLoading(true)
    setTimeout(() => {
      setSavedName(name)
      setIsDirty(false)
      setIsLoading(false)
    }, 1500)
  }

  return (
    <div className="max-w-md p-8">
      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => {
              setName(e.target.value)
              setIsDirty(e.target.value !== savedName)
            }}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
            placeholder="Enter name"
          />
        </div>

        <SaveButton
          isDirty={isDirty}
          isLoading={isLoading}
          onClick={handleSave}
        />
      </div>

      <div className="mt-6 p-4 bg-muted rounded-lg space-y-2">
        <p className="text-sm font-medium">State:</p>
        <p className="text-xs text-muted-foreground">Current: {name}</p>
        <p className="text-xs text-muted-foreground">Saved: {savedName}</p>
        <p className="text-xs text-muted-foreground">
          Dirty: {isDirty ? 'Yes' : 'No'}
        </p>
        <p className="text-xs text-muted-foreground">
          Loading: {isLoading ? 'Yes' : 'No'}
        </p>
      </div>
    </div>
  )
}

export const RealWorldProfileForm = () => {
  const [isDirty, setIsDirty] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const [formData, setFormData] = useState({
    name: 'Jane Smith',
    email: 'jane@example.com',
    bio: 'Software engineer',
  })

  const [savedData, setSavedData] = useState({...formData})

  const handleChange = (field: string, value: string) => {
    const newData = { ...formData, [field]: value }
    setFormData(newData)
    setIsDirty(JSON.stringify(newData) !== JSON.stringify(savedData))
  }

  const handleSave = () => {
    setIsLoading(true)
    setTimeout(() => {
      setSavedData(formData)
      setIsDirty(false)
      setIsLoading(false)
    }, 2000)
  }

  return (
    <div className="max-w-md p-8">
      <div className="space-y-6">
        <h2 className="text-xl font-semibold">Edit Profile</h2>

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Bio</label>
            <textarea
              value={formData.bio}
              onChange={(e) => handleChange('bio', e.target.value)}
              className="w-full h-20 px-3 py-2 border rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => {
              setFormData(savedData)
              setIsDirty(false)
            }}
            disabled={!isDirty}
            className="px-4 py-2 border rounded-md text-sm hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <SaveButton
            isDirty={isDirty}
            isLoading={isLoading}
            onClick={handleSave}
            saveText="Save Changes"
            className="flex-1"
          />
        </div>

        {!isDirty && !isLoading && (
          <p className="text-xs text-green-600">✓ All changes saved</p>
        )}
      </div>
    </div>
  )
}

export const FullWidthButton = () => (
  <div className="max-w-md p-8">
    <SaveButton
      isDirty={true}
      isLoading={false}
      className="w-full"
    />
  </div>
)

export const SmallButton = () => (
  <div className="max-w-md p-8">
    <SaveButton
      isDirty={true}
      isLoading={false}
      size="sm"
      saveText="Save"
    />
  </div>
)

export const LargeButton = () => (
  <div className="max-w-md p-8">
    <SaveButton
      isDirty={true}
      isLoading={false}
      size="lg"
      saveText="Save Changes"
    />
  </div>
)

export const AllStates = () => (
  <div className="max-w-md p-8 space-y-6">
    <div className="space-y-2">
      <p className="text-sm font-medium">Pristine (Disabled)</p>
      <SaveButton isDirty={false} isLoading={false} />
    </div>

    <div className="space-y-2">
      <p className="text-sm font-medium">Dirty (Enabled)</p>
      <SaveButton isDirty={true} isLoading={false} />
    </div>

    <div className="space-y-2">
      <p className="text-sm font-medium">Loading</p>
      <SaveButton isDirty={true} isLoading={true} />
    </div>

    <div className="space-y-2">
      <p className="text-sm font-medium">Disabled (Manual Override)</p>
      <SaveButton isDirty={true} isLoading={false} disabled={true} />
    </div>
  </div>
)
