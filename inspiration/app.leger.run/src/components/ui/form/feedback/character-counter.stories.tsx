import type { StoryDefault } from '@ladle/react'
import { useState } from 'react'
import { CharacterCounter } from './character-counter'

export default {
  title: 'Form Feedback / Character Counter',
} satisfies StoryDefault

export const Basic = () => (
  <div className="max-w-md p-8">
    <CharacterCounter current={45} maximum={100} />
  </div>
)

export const NearLimit = () => (
  <div className="max-w-md p-8">
    <CharacterCounter current={85} maximum={100} />

    <div className="mt-4 p-4 bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-lg">
      <p className="text-sm text-amber-900 dark:text-amber-100">
        ⚠️ When over 80% of the limit, the counter turns amber
      </p>
    </div>
  </div>
)

export const AtLimit = () => (
  <div className="max-w-md p-8">
    <CharacterCounter current={100} maximum={100} />

    <div className="mt-4 p-4 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg">
      <p className="text-sm text-red-900 dark:text-red-100">
        🚫 At or over the limit, the counter turns red
      </p>
    </div>
  </div>
)

export const OverLimit = () => (
  <div className="max-w-md p-8">
    <CharacterCounter current={120} maximum={100} />

    <div className="mt-4 p-4 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg">
      <p className="text-sm text-red-900 dark:text-red-100">
        🚫 Over the limit - typically validation would prevent submission
      </p>
    </div>
  </div>
)

export const WithTextArea = () => {
  const maxLength = 200
  const [text, setText] = useState('This is a sample text')

  return (
    <div className="max-w-md p-8">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium">Description</label>
          <CharacterCounter current={text.length} maximum={maxLength} />
        </div>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="w-full h-24 px-3 py-2 border rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-ring"
          placeholder="Enter description..."
        />
      </div>
    </div>
  )
}

export const WithInput = () => {
  const maxLength = 50
  const [text, setText] = useState('')

  return (
    <div className="max-w-md p-8">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium">Username</label>
          <CharacterCounter current={text.length} maximum={maxLength} />
        </div>
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
          placeholder="Choose a username"
        />
      </div>
    </div>
  )
}

export const VariousStages = () => (
  <div className="max-w-md p-8 space-y-6">
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm">Start (0/100)</span>
        <CharacterCounter current={0} maximum={100} />
      </div>
      <div className="h-2 bg-muted rounded" />
    </div>

    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm">Normal (50/100)</span>
        <CharacterCounter current={50} maximum={100} />
      </div>
      <div className="h-2 bg-muted rounded" />
    </div>

    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm">Near Limit (85/100)</span>
        <CharacterCounter current={85} maximum={100} />
      </div>
      <div className="h-2 bg-muted rounded" />
    </div>

    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm">At Limit (100/100)</span>
        <CharacterCounter current={100} maximum={100} />
      </div>
      <div className="h-2 bg-muted rounded" />
    </div>

    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm">Over Limit (110/100)</span>
        <CharacterCounter current={110} maximum={100} />
      </div>
      <div className="h-2 bg-muted rounded" />
    </div>
  </div>
)

export const ShortLimit = () => {
  const maxLength = 25
  const [text, setText] = useState('Hello')

  return (
    <div className="max-w-md p-8">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium">Short Message (25 char limit)</label>
          <CharacterCounter current={text.length} maximum={maxLength} />
        </div>
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
          placeholder="Enter a short message"
        />
      </div>
    </div>
  )
}

export const LongLimit = () => {
  const maxLength = 500
  const [text, setText] = useState('')

  return (
    <div className="max-w-md p-8">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium">Essay (500 char limit)</label>
          <CharacterCounter current={text.length} maximum={maxLength} />
        </div>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="w-full h-32 px-3 py-2 border rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-ring"
          placeholder="Write your essay here..."
        />
      </div>
    </div>
  )
}

export const RealWorldBioField = () => {
  const maxLength = 160
  const [bio, setBio] = useState('')

  return (
    <div className="max-w-md p-8">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium">Bio</label>
          <CharacterCounter current={bio.length} maximum={maxLength} />
        </div>
        <textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          className="w-full h-20 px-3 py-2 border rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-ring"
          placeholder="Tell us about yourself in 160 characters or less"
        />
        <p className="text-xs text-muted-foreground">
          This will appear on your public profile
        </p>
      </div>
    </div>
  )
}

export const RealWorldTweetStyle = () => {
  const maxLength = 280
  const [tweet, setTweet] = useState('')

  return (
    <div className="max-w-md p-8">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium">What's happening?</label>
          <CharacterCounter current={tweet.length} maximum={maxLength} />
        </div>
        <textarea
          value={tweet}
          onChange={(e) => setTweet(e.target.value)}
          className="w-full h-24 px-3 py-2 border rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-ring"
          placeholder="Share your thoughts..."
        />
      </div>
    </div>
  )
}

export const CustomClassName = () => (
  <div className="max-w-md p-8">
    <CharacterCounter
      current={75}
      maximum={100}
      className="text-lg font-bold"
    />

    <div className="mt-4 p-4 bg-muted rounded-lg">
      <p className="text-sm">Custom styling applied via className prop</p>
    </div>
  </div>
)
