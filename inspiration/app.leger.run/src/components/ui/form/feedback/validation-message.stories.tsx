import type { StoryDefault } from '@ladle/react'
import { ValidationMessage } from './validation-message'

export default {
  title: 'Form Feedback / Validation Message',
} satisfies StoryDefault

export const Basic = () => (
  <div className="max-w-md p-8 space-y-4">
    <ValidationMessage message="This field is required" />
  </div>
)

export const LongMessage = () => (
  <div className="max-w-md p-8 space-y-4">
    <ValidationMessage message="The password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character" />
  </div>
)

export const MultipleMessages = () => (
  <div className="max-w-md p-8 space-y-3">
    <ValidationMessage message="Email is required" />
    <ValidationMessage message="Password must be at least 8 characters" />
    <ValidationMessage message="Passwords do not match" />
  </div>
)

export const InFormContext = () => (
  <div className="max-w-md p-8">
    <div className="space-y-2">
      <label className="text-sm font-medium">Email Address</label>
      <input
        type="email"
        className="w-full px-3 py-2 border border-destructive rounded-md focus:outline-none focus:ring-2 focus:ring-destructive"
        placeholder="you@example.com"
        defaultValue="invalid email"
      />
      <ValidationMessage message="Please enter a valid email address" />
    </div>
  </div>
)

export const CustomClassName = () => (
  <div className="max-w-md p-8">
    <ValidationMessage
      message="Custom styled validation message"
      className="bg-destructive/10 p-3 rounded-md"
    />
  </div>
)

export const RealWorldPasswordValidation = () => (
  <div className="max-w-md p-8 space-y-6">
    <div className="space-y-2">
      <label className="text-sm font-medium">Create Password</label>
      <input
        type="password"
        className="w-full px-3 py-2 border border-destructive rounded-md focus:outline-none focus:ring-2 focus:ring-destructive"
        placeholder="Enter password"
        defaultValue="weak"
      />
      <ValidationMessage message="Password must be at least 8 characters" />
    </div>

    <div className="space-y-2">
      <label className="text-sm font-medium">Confirm Password</label>
      <input
        type="password"
        className="w-full px-3 py-2 border border-destructive rounded-md focus:outline-none focus:ring-2 focus:ring-destructive"
        placeholder="Confirm password"
        defaultValue="different"
      />
      <ValidationMessage message="Passwords do not match" />
    </div>
  </div>
)

export const MultipleFields = () => (
  <div className="max-w-md p-8 space-y-6">
    <div className="space-y-2">
      <label className="text-sm font-medium">Name</label>
      <input
        type="text"
        className="w-full px-3 py-2 border border-destructive rounded-md"
        placeholder="Your name"
      />
      <ValidationMessage message="Name is required" />
    </div>

    <div className="space-y-2">
      <label className="text-sm font-medium">Age</label>
      <input
        type="number"
        className="w-full px-3 py-2 border border-destructive rounded-md"
        placeholder="Your age"
        defaultValue="15"
      />
      <ValidationMessage message="You must be at least 18 years old" />
    </div>

    <div className="space-y-2">
      <label className="text-sm font-medium">Website</label>
      <input
        type="url"
        className="w-full px-3 py-2 border border-destructive rounded-md"
        placeholder="https://example.com"
        defaultValue="not a url"
      />
      <ValidationMessage message="Please enter a valid URL starting with http:// or https://" />
    </div>
  </div>
)
