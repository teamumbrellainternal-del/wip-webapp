import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import AppLayout from '@/components/layout/AppLayout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { AlertTriangle, Trash2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

export default function SettingsPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { toast } = useToast()
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deleteConfirmation, setDeleteConfirmation] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDeleteAccount = async () => {
    if (deleteConfirmation !== 'DELETE') {
      toast({
        title: 'Invalid confirmation',
        description: 'Please type DELETE to confirm account deletion',
        variant: 'destructive',
      })
      return
    }

    setIsDeleting(true)

    try {
      const response = await fetch('/v1/account', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to delete account')
      }

      // Account deleted successfully
      toast({
        title: 'Account deleted',
        description: 'Your account has been permanently deleted. You will receive a confirmation email.',
      })

      // Close dialog and redirect to login after short delay
      setDeleteDialogOpen(false)
      setTimeout(() => {
        navigate('/auth?message=account_deleted')
      }, 1500)
    } catch (error) {
      console.error('Error deleting account:', error)
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to delete account',
        variant: 'destructive',
      })
      setIsDeleting(false)
    }
  }

  if (!user) return null

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold tracking-tight mb-2">Account Settings</h1>
          <p className="text-muted-foreground">Manage your account preferences and data</p>
        </div>

        <div className="space-y-6">
          {/* Account Information */}
          <Card>
            <CardHeader>
              <CardTitle>Account Information</CardTitle>
              <CardDescription>View your account details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Email</Label>
                <p className="text-sm text-muted-foreground">{user.email}</p>
              </div>
              <div>
                <Label>Name</Label>
                <p className="text-sm text-muted-foreground">{user.name || 'Not set'}</p>
              </div>
            </CardContent>
          </Card>

          {/* Profile Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Profile Settings</CardTitle>
              <CardDescription>Manage your public profile</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button onClick={() => navigate('/profile/edit')}>
                Edit Profile
              </Button>
            </CardContent>
          </Card>

          {/* Privacy & Data */}
          <Card>
            <CardHeader>
              <CardTitle>Privacy & Data</CardTitle>
              <CardDescription>Manage your privacy settings and data</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Button variant="outline" asChild>
                  <a href="/legal/privacy" target="_blank" rel="noopener noreferrer">
                    Privacy Policy
                  </a>
                </Button>
                <Button variant="outline" asChild className="ml-2">
                  <a href="/legal/terms" target="_blank" rel="noopener noreferrer">
                    Terms of Service
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Separator className="my-8" />

          {/* Danger Zone - Delete Account */}
          <Card className="border-red-200 dark:border-red-800">
            <CardHeader>
              <CardTitle className="text-red-600 dark:text-red-400 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Danger Zone
              </CardTitle>
              <CardDescription>
                Irreversible actions that will permanently affect your account
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg bg-red-50 dark:bg-red-950 p-4 border border-red-200 dark:border-red-800">
                <div className="flex items-start gap-3">
                  <Trash2 className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-red-900 dark:text-red-100 mb-1">
                      Delete Account
                    </h3>
                    <p className="text-sm text-red-800 dark:text-red-200 mb-4">
                      Permanently delete your account and all associated data. This action cannot
                      be undone and complies with CCPA data deletion requirements.
                    </p>
                    <p className="text-sm text-red-800 dark:text-red-200 mb-4">
                      When you delete your account, we will:
                    </p>
                    <ul className="text-sm text-red-800 dark:text-red-200 list-disc list-inside mb-4 space-y-1">
                      <li>Delete your profile and all personal information</li>
                      <li>Remove all uploaded files, tracks, and media</li>
                      <li>Delete all messages and conversations</li>
                      <li>Remove all analytics and usage data</li>
                      <li>Delete your authentication account</li>
                      <li>Send you a confirmation email</li>
                    </ul>
                    <Button
                      variant="destructive"
                      onClick={() => setDeleteDialogOpen(true)}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete My Account
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600 dark:text-red-400">
              <AlertTriangle className="h-5 w-5" />
              Confirm Account Deletion
            </DialogTitle>
            <DialogDescription className="pt-4">
              This action is permanent and cannot be undone. All your data will be deleted
              immediately and cannot be recovered.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="rounded-lg bg-red-50 dark:bg-red-950 p-4 border border-red-200 dark:border-red-800">
              <p className="text-sm font-semibold text-red-900 dark:text-red-100 mb-2">
                The following data will be permanently deleted:
              </p>
              <ul className="text-sm text-red-800 dark:text-red-200 list-disc list-inside space-y-1">
                <li>Your profile and personal information</li>
                <li>All uploaded files and media ({user.name}'s content)</li>
                <li>All messages and conversations</li>
                <li>All application history and analytics</li>
                <li>Your authentication credentials</li>
              </ul>
            </div>
            <div className="space-y-2">
              <Label htmlFor="delete-confirmation" className="text-sm font-medium">
                To confirm, type <span className="font-mono font-bold">DELETE</span> below:
              </Label>
              <Input
                id="delete-confirmation"
                placeholder="DELETE"
                value={deleteConfirmation}
                onChange={(e) => setDeleteConfirmation(e.target.value)}
                disabled={isDeleting}
                className="font-mono"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setDeleteDialogOpen(false)
                setDeleteConfirmation('')
              }}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteAccount}
              disabled={deleteConfirmation !== 'DELETE' || isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? (
                <>Deleting...</>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Account Permanently
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  )
}
