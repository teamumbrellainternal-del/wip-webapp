import { useState, useEffect } from 'react'
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
import { SlugEditor } from '@/components/settings'

export default function SettingsPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { toast } = useToast()
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deleteConfirmation, setDeleteConfirmation] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)
  const [currentSlug, setCurrentSlug] = useState<string | undefined>(undefined)
  const [userRole, setUserRole] = useState<'artist' | 'venue'>('artist')

  // Fetch current profile to get slug
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        // First check if user is a venue
        const venueResponse = await fetch('/v1/venue/profile', {
          credentials: 'include',
        })
        if (venueResponse.ok) {
          const venueData = await venueResponse.json()
          if (venueData.success && venueData.data?.venue) {
            setUserRole('venue')
            setCurrentSlug(venueData.data.venue.slug)
            return
          }
        }

        // Otherwise, assume artist
        const artistResponse = await fetch('/v1/profile', {
          credentials: 'include',
        })
        if (artistResponse.ok) {
          const artistData = await artistResponse.json()
          if (artistData.success && artistData.data) {
            setUserRole('artist')
            setCurrentSlug(artistData.data.slug)
          }
        }
      } catch (error) {
        console.error('Error fetching profile for slug:', error)
      }
    }

    if (user) {
      fetchProfile()
    }
  }, [user])

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
        description:
          'Your account has been permanently deleted. You will receive a confirmation email.',
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
      <div className="container mx-auto max-w-4xl px-4 py-8">
        <div className="mb-8">
          <h1 className="mb-2 text-4xl font-bold tracking-tight">Account Settings</h1>
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
              <Button onClick={() => navigate('/profile/edit')}>Edit Profile</Button>
            </CardContent>
          </Card>

          {/* Custom Profile URL */}
          <Card>
            <CardHeader>
              <CardTitle>Custom Profile URL</CardTitle>
              <CardDescription>
                Customize your profile link for easier sharing and better search visibility
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SlugEditor
                currentSlug={currentSlug}
                type={userRole}
                onSlugUpdate={(newSlug) => setCurrentSlug(newSlug)}
              />
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
              <CardTitle className="flex items-center gap-2 text-red-600 dark:text-red-400">
                <AlertTriangle className="h-5 w-5" />
                Danger Zone
              </CardTitle>
              <CardDescription>
                Irreversible actions that will permanently affect your account
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-950">
                <div className="flex items-start gap-3">
                  <Trash2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-600 dark:text-red-400" />
                  <div className="flex-1">
                    <h3 className="mb-1 font-semibold text-red-900 dark:text-red-100">
                      Delete Account
                    </h3>
                    <p className="mb-4 text-sm text-red-800 dark:text-red-200">
                      Permanently delete your account and all associated data. This action cannot be
                      undone and complies with CCPA data deletion requirements.
                    </p>
                    <p className="mb-4 text-sm text-red-800 dark:text-red-200">
                      When you delete your account, we will:
                    </p>
                    <ul className="mb-4 list-inside list-disc space-y-1 text-sm text-red-800 dark:text-red-200">
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
                      <Trash2 className="mr-2 h-4 w-4" />
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
          <div className="space-y-4 py-4">
            <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-950">
              <p className="mb-2 text-sm font-semibold text-red-900 dark:text-red-100">
                The following data will be permanently deleted:
              </p>
              <ul className="list-inside list-disc space-y-1 text-sm text-red-800 dark:text-red-200">
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
                  <Trash2 className="mr-2 h-4 w-4" />
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
