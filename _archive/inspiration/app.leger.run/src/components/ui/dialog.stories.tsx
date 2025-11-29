// src/components/ui/dialog.stories.tsx
import type { Story } from '@ladle/react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './dialog'
import { Button } from './button'
import { Label } from './label'
import { Input } from './input'
import { useState } from 'react'

export default {
  title: 'Components / Dialog',
}

export const Basic: Story = () => (
  <div className="p-8">
    <Dialog>
      <DialogTrigger asChild>
        <Button>Open Dialog</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirm Deployment</DialogTitle>
          <DialogDescription>
            Are you sure you want to deploy this service to production? This action will make your
            changes live.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline">Cancel</Button>
          <Button>Deploy</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
)

Basic.meta = {
  description: 'Basic confirmation dialog',
}

export const WithForm: Story = () => {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')

  return (
    <div className="p-8">
      <Dialog>
        <DialogTrigger asChild>
          <Button>Create Service</Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>Create New Service</DialogTitle>
            <DialogDescription>
              Add a new AI service to your Leger workspace. Click save when you're done.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Service Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="my-ai-service"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe your service"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline">Cancel</Button>
            <Button>Create Service</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

WithForm.meta = {
  description: 'Dialog with form inputs',
}

export const Destructive: Story = () => (
  <div className="p-8">
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="destructive">Delete Service</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Are you absolutely sure?</DialogTitle>
          <DialogDescription>
            This action cannot be undone. This will permanently delete your service and remove all
            associated data from our servers.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline">Cancel</Button>
          <Button variant="destructive">Delete Permanently</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
)

Destructive.meta = {
  description: 'Destructive action dialog (delete confirmation)',
}
