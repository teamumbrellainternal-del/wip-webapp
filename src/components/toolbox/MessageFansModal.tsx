/**
 * MessageFansModal Component
 * Simplified broadcast messaging interface for the toolbox
 */

import { useState, useEffect } from 'react'
import { ArrowLeft, Send, Save, Loader2, Users, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { contactsService, broadcastService } from '@/services/api'
import type { ContactList } from '@/types'
import { cn } from '@/lib/utils'
import { useToast } from '@/hooks/use-toast'

const MESSAGE_CHAR_LIMIT = 5000
const SUBJECT_CHAR_LIMIT = 200

interface MessageFansModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onBack: () => void
}

export function MessageFansModal({ open, onOpenChange, onBack }: MessageFansModalProps) {
  const { toast } = useToast()

  // State for contact lists
  const [contactLists, setContactLists] = useState<ContactList[]>([])
  const [selectedListIds, setSelectedListIds] = useState<Set<string>>(new Set())
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)

  // State for message composition
  const [subject, setSubject] = useState('')
  const [messageBody, setMessageBody] = useState('')

  // State for sending
  const [savingDraft, setSavingDraft] = useState(false)
  const [sendingNow, setSendingNow] = useState(false)

  // Fetch contact lists on mount
  useEffect(() => {
    if (open) {
      const fetchContactLists = async () => {
        try {
          setLoading(true)
          const lists = await contactsService.getLists()
          setContactLists(lists)
        } catch (err) {
          console.error('Error fetching contact lists:', err)
          toast({
            title: 'Failed to load contact lists',
            variant: 'destructive',
          })
        } finally {
          setLoading(false)
        }
      }
      fetchContactLists()
    }
  }, [open])

  // Calculate total recipient count
  const totalRecipients = Array.from(selectedListIds).reduce((total, listId) => {
    const list = contactLists.find((l) => l.id === listId)
    return total + (list?.contact_count || 0)
  }, 0)

  // Filter contact lists based on search query
  const filteredLists = contactLists.filter((list) =>
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

  // Handle save draft
  const handleSaveDraft = async () => {
    if (!subject.trim() && !messageBody.trim()) {
      toast({
        title: 'Missing content',
        description: 'Please enter a subject or message before saving.',
        variant: 'destructive',
      })
      return
    }

    try {
      setSavingDraft(true)
      await broadcastService.saveDraft({
        subject: subject.trim(),
        body: messageBody.trim(),
        list_ids: Array.from(selectedListIds),
      })
      toast({
        title: 'Draft saved!',
      })
    } catch (err) {
      console.error('Error saving draft:', err)
      toast({
        title: 'Failed to save draft',
        variant: 'destructive',
      })
    } finally {
      setSavingDraft(false)
    }
  }

  // Handle send now
  const handleSendNow = async () => {
    if (!subject.trim() || !messageBody.trim()) {
      toast({
        title: 'Missing content',
        description: 'Please enter a subject and message.',
        variant: 'destructive',
      })
      return
    }

    if (selectedListIds.size === 0) {
      toast({
        title: 'No recipients selected',
        description: 'Please select at least one contact list.',
        variant: 'destructive',
      })
      return
    }

    try {
      setSendingNow(true)
      const response = await broadcastService.send({
        list_ids: Array.from(selectedListIds),
        subject: subject.trim(),
        body: messageBody.trim(),
      })

      toast({
        title: 'Message sent!',
        description:
          response.recipient_count === 1
            ? `Your message is on its way to your fan!`
            : `Your message is on its way to ${response.recipient_count} fans!`,
      })

      // Clear form and close after a brief moment so user sees the toast
      setSubject('')
      setMessageBody('')
      setSelectedListIds(new Set())
      setTimeout(() => {
        onOpenChange(false)
      }, 1500)
    } catch (err) {
      console.error('Error sending message:', err)
      toast({
        title: 'Failed to send message',
        description: err instanceof Error ? err.message : 'Please try again',
        variant: 'destructive',
      })
    } finally {
      setSendingNow(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex h-[80vh] max-h-[700px] max-w-4xl flex-col p-0">
        <DialogHeader className="border-b px-6 py-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={onBack} className="h-8 w-8">
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <DialogTitle>Message Fans</DialogTitle>
              <DialogDescription>Send broadcast messages to your followers</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="flex flex-1 overflow-hidden">
          {/* Left Panel - Contact Lists */}
          <div className="flex w-64 flex-col border-r bg-muted/30">
            <div className="border-b p-3">
              <div className="relative mb-2">
                <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search lists..."
                  className="h-8 pl-8 text-sm"
                />
              </div>
              <div className="flex items-center gap-1.5 text-xs">
                <Users className="h-3.5 w-3.5 text-primary" />
                <span className="font-medium text-primary">{totalRecipients} recipients</span>
              </div>
            </div>

            <ScrollArea className="flex-1 p-2">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
              ) : filteredLists.length === 0 ? (
                <div className="py-8 text-center text-xs text-muted-foreground">
                  {searchQuery ? 'No lists found' : 'No contact lists yet'}
                </div>
              ) : (
                <div className="space-y-1.5">
                  {filteredLists.map((list) => (
                    <div
                      key={list.id}
                      className={cn(
                        'flex cursor-pointer items-start gap-2 rounded-md p-2 transition-colors hover:bg-muted',
                        selectedListIds.has(list.id) && 'bg-primary/10'
                      )}
                      onClick={() => toggleListSelection(list.id)}
                    >
                      <Checkbox
                        checked={selectedListIds.has(list.id)}
                        onCheckedChange={() => toggleListSelection(list.id)}
                        className="mt-0.5"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-medium">{list.list_name}</p>
                        <p className="text-[10px] text-muted-foreground">
                          {list.contact_count} contacts
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>

          {/* Right Panel - Message Composer */}
          <div className="flex flex-1 flex-col">
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {/* Subject Line */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium">Subject Line</label>
                  <Input
                    value={subject}
                    onChange={(e) => setSubject(e.target.value.substring(0, SUBJECT_CHAR_LIMIT))}
                    placeholder="Enter email subject..."
                    className="h-9"
                  />
                </div>

                {/* Message Body */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium">Message</label>
                  <Textarea
                    value={messageBody}
                    onChange={(e) =>
                      setMessageBody(e.target.value.substring(0, MESSAGE_CHAR_LIMIT))
                    }
                    placeholder="Type your message here..."
                    className="min-h-[200px] resize-none text-sm"
                  />
                  <p className="text-right text-[10px] text-muted-foreground">
                    {messageBody.length}/{MESSAGE_CHAR_LIMIT}
                  </p>
                </div>

                {/* Info Card */}
                <Card className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950">
                  <CardContent className="p-3">
                    <p className="text-xs text-blue-800 dark:text-blue-200">
                      Messages will be sent via email to opted-in contacts with an unsubscribe link.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </ScrollArea>

            {/* Action Buttons */}
            <div className="flex gap-2 border-t bg-muted/30 p-3">
              <Button
                onClick={handleSaveDraft}
                disabled={savingDraft || (!subject.trim() && !messageBody.trim())}
                variant="outline"
                size="sm"
                className="flex-1"
              >
                {savingDraft ? (
                  <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Save className="mr-2 h-3.5 w-3.5" />
                )}
                Save Draft
              </Button>
              <Button
                onClick={handleSendNow}
                disabled={
                  sendingNow || !subject.trim() || !messageBody.trim() || selectedListIds.size === 0
                }
                size="sm"
                className="flex-1"
              >
                {sendingNow ? (
                  <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Send className="mr-2 h-3.5 w-3.5" />
                )}
                Send Now
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default MessageFansModal
