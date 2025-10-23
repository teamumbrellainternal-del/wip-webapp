// src/components/ui/alert-dialog.stories.tsx
import type { Story } from '@ladle/react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from './alert-dialog'
import { Button } from './button'
import { Trash2, AlertTriangle } from 'lucide-react'

export default {
  title: 'Feedback / Alert Dialog',
}

export const DeleteConfirmation: Story = () => (
  <div className="p-8 flex justify-center">
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="destructive">
          <Trash2 className="mr-2 h-4 w-4" />
          Delete Service
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete the service
            "my-api-service" and remove all associated data from our servers.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  </div>
)

DeleteConfirmation.meta = {
  description: 'Confirmation dialog for destructive actions',
}

export const Warning: Story = () => (
  <div className="p-8 flex justify-center">
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="outline">
          <AlertTriangle className="mr-2 h-4 w-4" />
          Reset API Keys
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-500" />
            Reset All API Keys
          </AlertDialogTitle>
          <AlertDialogDescription>
            This will invalidate all existing API keys and generate new ones.
            Any services using the old keys will stop working until updated.
            <br /><br />
            <strong>Services affected:</strong> 3 active services
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction>Continue</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  </div>
)

Warning.meta = {
  description: 'Warning dialog with detailed information',
}

export const SimpleConfirm: Story = () => (
  <div className="p-8 flex justify-center">
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button>Deploy Now</Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Deploy to Production?</AlertDialogTitle>
          <AlertDialogDescription>
            This will deploy the current commit to production. Make sure all tests have passed.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Not Yet</AlertDialogCancel>
          <AlertDialogAction>Deploy</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  </div>
)

SimpleConfirm.meta = {
  description: 'Simple confirmation dialog',
}
