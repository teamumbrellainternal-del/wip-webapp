import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { CharacterCounter } from '@/components/ui/character-counter'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Send,
  Save,
  Calendar,
  Users,
  Search,
  Sparkles,
  Loader2,
} from 'lucide-react'
import AppLayout from '@/components/layout/AppLayout'
import LoadingState from '@/components/common/LoadingState'
import ErrorState from '@/components/common/ErrorState'
import { contactsService, broadcastService, violetService } from '@/services/api'
import type { ContactList } from '@/types'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

const MESSAGE_CHAR_LIMIT = 5000
const SUBJECT_CHAR_LIMIT = 200

export default function MessageFansPage() {
  const { user } = useAuth()

  // State for contact lists
  const [contactLists, setContactLists] = useState<ContactList[]>([])
  const [selectedListIds, setSelectedListIds] = useState<Set<string>>(new Set())
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  // State for message composition
  const [subject, setSubject] = useState('')
  const [messageBody, setMessageBody] = useState('')

  // State for AI draft
  const [aiDraftLoading, setAiDraftLoading] = useState(false)

  // State for scheduling
  const [showScheduleModal, setShowScheduleModal] = useState(false)
  const [scheduledDate, setScheduledDate] = useState('')
  const [scheduledTime, setScheduledTime] = useState('')

  // State for confirmation
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [sendingNow, setSendingNow] = useState(false)

  // State for saving draft
  const [savingDraft, setSavingDraft] = useState(false)

  // Fetch contact lists on mount
  useEffect(() => {
    const fetchContactLists = async () => {
      try {
        setLoading(true)
        const lists = await contactsService.getLists()
        setContactLists(lists)
        setError(null)
      } catch (err) {
        console.error('Error fetching contact lists:', err)
        setError(err as Error)
      } finally {
        setLoading(false)
      }
    }

    fetchContactLists()
  }, [])

  // Calculate total recipient count
  const totalRecipients = Array.from(selectedListIds).reduce((total, listId) => {
    const list = contactLists.find(l => l.id === listId)
    return total + (list?.contact_count || 0)
  }, 0)

  // Filter contact lists based on search query
  const filteredLists = contactLists.filter(list =>
    list.list_name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Handle list selection toggle
  const toggleListSelection = (listId: string) => {
    const newSelected = new Set(selectedListIds)
    if (newSelected.has(listId)) {
      newSelected.delete(listId)
    } else {
      newSelected.add(listId)
    }
    setSelectedListIds(newSelected)
  }

  // Handle "Ask Violet to Draft" button
  const handleAskVioletToDraft = async () => {
    try {
      setAiDraftLoading(true)

      // Build context for AI prompt
      const context = {
        context: 'draft_message',
        recipient_count: totalRecipients,
        selected_lists: Array.from(selectedListIds).map(id => {
          const list = contactLists.find(l => l.id === id)
          return list?.list_name
        }).join(', '),
      }

      const response = await violetService.sendPrompt(
        'Help me draft a message to my fans. Create an engaging subject line and message body.',
        context
      )

      // Parse AI response to extract subject and body
      // Assuming the AI returns a structured response
      // For now, we'll put the whole response in the body and let the user edit
      const aiText = response.response

      // Try to parse if it has "Subject:" and "Body:" sections
      const subjectMatch = aiText.match(/Subject:\s*(.+?)(?:\n|$)/i)
      const bodyMatch = aiText.match(/Body:\s*([\s\S]+)/i)

      if (subjectMatch && bodyMatch) {
        setSubject(subjectMatch[1].trim().substring(0, SUBJECT_CHAR_LIMIT))
        setMessageBody(bodyMatch[1].trim().substring(0, MESSAGE_CHAR_LIMIT))
      } else {
        // If not structured, put it all in the body
        setMessageBody(aiText.substring(0, MESSAGE_CHAR_LIMIT))
        toast.info('AI draft generated! You may want to add a subject line.')
      }

      toast.success('AI draft generated successfully!')
    } catch (err) {
      console.error('Error generating AI draft:', err)
      toast.error('Failed to generate AI draft. Please try again.')
    } finally {
      setAiDraftLoading(false)
    }
  }

  // Handle save draft
  const handleSaveDraft = async () => {
    if (!subject.trim() && !messageBody.trim()) {
      toast.error('Please enter a subject or message before saving.')
      return
    }

    try {
      setSavingDraft(true)
      await broadcastService.saveDraft({
        subject: subject.trim(),
        body: messageBody.trim(),
        list_ids: Array.from(selectedListIds),
      })
      toast.success('Draft saved successfully!')
    } catch (err) {
      console.error('Error saving draft:', err)
      toast.error('Failed to save draft. Please try again.')
    } finally {
      setSavingDraft(false)
    }
  }

  // Handle schedule send
  const handleScheduleSend = () => {
    if (!subject.trim() || !messageBody.trim()) {
      toast.error('Please enter a subject and message.')
      return
    }

    if (selectedListIds.size === 0) {
      toast.error('Please select at least one contact list.')
      return
    }

    setShowScheduleModal(true)
  }

  // Confirm schedule send
  const confirmScheduleSend = async () => {
    if (!scheduledDate || !scheduledTime) {
      toast.error('Please select a date and time.')
      return
    }

    const scheduledDateTime = `${scheduledDate}T${scheduledTime}:00`
    const scheduledTimestamp = new Date(scheduledDateTime)

    if (scheduledTimestamp <= new Date()) {
      toast.error('Scheduled time must be in the future.')
      return
    }

    try {
      await broadcastService.send({
        list_ids: Array.from(selectedListIds),
        subject: subject.trim(),
        body: messageBody.trim(),
        scheduled_at: scheduledTimestamp.toISOString(),
      })

      toast.success(`Message scheduled for ${scheduledTimestamp.toLocaleString()}!`)
      setShowScheduleModal(false)

      // Clear form
      setSubject('')
      setMessageBody('')
      setSelectedListIds(new Set())
      setScheduledDate('')
      setScheduledTime('')
    } catch (err) {
      console.error('Error scheduling message:', err)
      toast.error('Failed to schedule message. Please try again.')
    }
  }

  // Handle send now
  const handleSendNow = () => {
    if (!subject.trim() || !messageBody.trim()) {
      toast.error('Please enter a subject and message.')
      return
    }

    if (selectedListIds.size === 0) {
      toast.error('Please select at least one contact list.')
      return
    }

    setShowConfirmModal(true)
  }

  // Confirm send now
  const confirmSendNow = async () => {
    try {
      setSendingNow(true)
      const response = await broadcastService.send({
        list_ids: Array.from(selectedListIds),
        subject: subject.trim(),
        body: messageBody.trim(),
      })

      toast.success(`Message sent to ${response.recipient_count} recipients!`)
      setShowConfirmModal(false)

      // Clear form
      setSubject('')
      setMessageBody('')
      setSelectedListIds(new Set())
    } catch (err) {
      console.error('Error sending message:', err)
      toast.error('Failed to send message. Please try again.')
    } finally {
      setSendingNow(false)
    }
  }

  // Word and character counters
  const wordCount = messageBody.trim().split(/\s+/).filter(w => w.length > 0).length

  if (!user) return null

  if (loading) {
    return (
      <AppLayout>
        <LoadingState message="Loading contact lists..." />
      </AppLayout>
    )
  }

  if (error && contactLists.length === 0) {
    return (
      <AppLayout>
        <ErrorState error={error} retry={() => window.location.reload()} />
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <div className="h-[calc(100vh-4rem)] flex flex-col md:flex-row">
        {/* Left Sidebar - Contact Lists */}
        <div className="w-full md:w-80 lg:w-96 border-r bg-muted/30 flex flex-col">
          {/* Header */}
          <div className="p-4 border-b bg-background">
            <h2 className="text-xl font-bold mb-3">Contact Lists</h2>

            {/* Search bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search lists..."
                className="pl-9"
              />
            </div>

            {/* Recipient count */}
            <div className="mt-3 flex items-center gap-2 text-sm">
              <Users className="h-4 w-4 text-primary" />
              <span className="font-semibold text-primary">
                {totalRecipients} recipient{totalRecipients !== 1 ? 's' : ''} selected
              </span>
            </div>
          </div>

          {/* Contact List Cards */}
          <ScrollArea className="flex-1">
            {filteredLists.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                <Users className="h-16 w-16 text-muted-foreground/50 mb-4" />
                <p className="text-muted-foreground font-medium">
                  {searchQuery ? 'No lists found' : 'No contact lists yet'}
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  {searchQuery ? 'Try a different search' : 'Create a contact list to get started'}
                </p>
              </div>
            ) : (
              <div className="p-3 space-y-2">
                {filteredLists.map((list) => (
                  <Card
                    key={list.id}
                    className={cn(
                      "cursor-pointer transition-all hover:shadow-md",
                      selectedListIds.has(list.id) && "border-primary bg-primary/5"
                    )}
                    onClick={() => toggleListSelection(list.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <Checkbox
                          checked={selectedListIds.has(list.id)}
                          onCheckedChange={() => toggleListSelection(list.id)}
                          className="mt-1"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm truncate mb-1">
                            {list.list_name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {list.contact_count} contact{list.contact_count !== 1 ? 's' : ''}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1 capitalize">
                            {list.list_type.replace('_', ' ')}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>

        {/* Main Panel - Message Composer */}
        <div className="flex-1 flex flex-col bg-background">
          {/* Header */}
          <div className="p-4 border-b bg-muted/30">
            <h2 className="text-2xl font-bold">Message Fans</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Compose and send messages to your fan lists
            </p>
          </div>

          {/* Composer Area */}
          <ScrollArea className="flex-1 p-6">
            <div className="max-w-4xl mx-auto space-y-6">
              {/* AI Draft Button */}
              <Card>
                <CardContent className="p-4">
                  <Button
                    onClick={handleAskVioletToDraft}
                    disabled={aiDraftLoading || selectedListIds.size === 0}
                    className="w-full"
                    variant="outline"
                  >
                    {aiDraftLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Generating draft...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4 mr-2" />
                        Ask Violet to Draft
                      </>
                    )}
                  </Button>
                  {selectedListIds.size === 0 && (
                    <p className="text-xs text-muted-foreground mt-2 text-center">
                      Select at least one contact list to use AI draft
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Subject Line */}
              <div className="space-y-2">
                <label htmlFor="subject" className="text-sm font-medium">
                  Subject Line
                </label>
                <Input
                  id="subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value.substring(0, SUBJECT_CHAR_LIMIT))}
                  placeholder="Enter email subject line..."
                  maxLength={SUBJECT_CHAR_LIMIT}
                />
                <div className="flex justify-end">
                  <CharacterCounter
                    current={subject.length}
                    maximum={SUBJECT_CHAR_LIMIT}
                  />
                </div>
              </div>

              <Separator />

              {/* Message Body */}
              <div className="space-y-2">
                <label htmlFor="message" className="text-sm font-medium">
                  Message Body
                </label>
                <Textarea
                  id="message"
                  value={messageBody}
                  onChange={(e) => setMessageBody(e.target.value.substring(0, MESSAGE_CHAR_LIMIT))}
                  placeholder="Type your message here... (text-only, no rich formatting)"
                  className="min-h-[300px] resize-none font-mono text-sm"
                  maxLength={MESSAGE_CHAR_LIMIT}
                />
                <div className="flex justify-between items-center text-xs text-muted-foreground">
                  <span>{wordCount} word{wordCount !== 1 ? 's' : ''}</span>
                  <CharacterCounter
                    current={messageBody.length}
                    maximum={MESSAGE_CHAR_LIMIT}
                  />
                </div>
              </div>

              {/* Information Notice */}
              <Card className="bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-800">
                <CardContent className="p-4">
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    <strong>Note:</strong> This MVP supports text-only broadcasts. Messages will be sent via email and SMS to opted-in contacts. All emails will include an unsubscribe link.
                  </p>
                </CardContent>
              </Card>
            </div>
          </ScrollArea>

          {/* Action Buttons */}
          <div className="border-t bg-muted/30 p-4">
            <div className="max-w-4xl mx-auto flex flex-col sm:flex-row gap-3">
              <Button
                onClick={handleSaveDraft}
                disabled={savingDraft || (!subject.trim() && !messageBody.trim())}
                variant="outline"
                className="flex-1"
              >
                {savingDraft ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Draft
                  </>
                )}
              </Button>
              <Button
                onClick={handleScheduleSend}
                disabled={!subject.trim() || !messageBody.trim() || selectedListIds.size === 0}
                variant="outline"
                className="flex-1"
              >
                <Calendar className="h-4 w-4 mr-2" />
                Schedule Send
              </Button>
              <Button
                onClick={handleSendNow}
                disabled={!subject.trim() || !messageBody.trim() || selectedListIds.size === 0}
                className="flex-1"
              >
                <Send className="h-4 w-4 mr-2" />
                Send Now
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Schedule Send Modal */}
      <Dialog open={showScheduleModal} onOpenChange={setShowScheduleModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Schedule Message</DialogTitle>
            <DialogDescription>
              Choose when you want this message to be sent to {totalRecipients} recipient{totalRecipients !== 1 ? 's' : ''}.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="schedule-date" className="text-sm font-medium">
                Date
              </label>
              <Input
                id="schedule-date"
                type="date"
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="schedule-time" className="text-sm font-medium">
                Time
              </label>
              <Input
                id="schedule-time"
                type="time"
                value={scheduledTime}
                onChange={(e) => setScheduledTime(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowScheduleModal(false)}>
              Cancel
            </Button>
            <Button onClick={confirmScheduleSend}>
              Schedule Send
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Send Confirmation Modal */}
      <Dialog open={showConfirmModal} onOpenChange={setShowConfirmModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Send</DialogTitle>
            <DialogDescription>
              Are you sure you want to send this message now?
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="bg-muted p-4 rounded-lg space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Recipients:</span>
                <span className="font-semibold">{totalRecipients} contact{totalRecipients !== 1 ? 's' : ''}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Lists:</span>
                <span className="font-semibold">{selectedListIds.size} list{selectedListIds.size !== 1 ? 's' : ''}</span>
              </div>
              <Separator className="my-2" />
              <div className="text-sm">
                <span className="text-muted-foreground">Subject:</span>
                <p className="font-semibold mt-1">{subject}</p>
              </div>
            </div>

            <p className="text-sm text-muted-foreground">
              This message will be sent immediately and cannot be undone.
            </p>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfirmModal(false)}>
              Cancel
            </Button>
            <Button onClick={confirmSendNow} disabled={sendingNow}>
              {sendingNow ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Send Now
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  )
}
