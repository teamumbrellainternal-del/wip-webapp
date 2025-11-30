/**
 * CreativeStudioModal Component
 * Apple Notes-style interface for the artist toolbox
 * Multiple notes per category with list sidebar and CRUD operations
 */

import { useState, useEffect, useRef } from 'react'
import { ArrowLeft, Save, Loader2, Clock, Music, Calendar, FileText, Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { journalService } from '@/services/api'
import type { JournalEntry, JournalEntryType, JournalBlock, TextBlockContent } from '@/types'
import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'

const QUICK_START_TEMPLATES = [
  { id: 'song_idea' as JournalEntryType, label: 'Song Ideas', icon: Music },
  { id: 'set_plan' as JournalEntryType, label: 'Set Planning', icon: Calendar },
  { id: 'general_note' as JournalEntryType, label: 'General Notes', icon: FileText },
] as const

interface CreativeStudioModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onBack: () => void
}

export function CreativeStudioModal({ open, onOpenChange, onBack }: CreativeStudioModalProps) {
  const { toast } = useToast()
  
  // Category state
  const [entryType, setEntryType] = useState<JournalEntryType>('general_note')
  
  // Notes list state
  const [notes, setNotes] = useState<JournalEntry[]>([])
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  
  // Editor state
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  
  // UI state
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null)

  // Load notes when modal opens or entry type changes
  useEffect(() => {
    if (open) {
      loadNotes()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, entryType])

  // Auto-save functionality (every 30 seconds)
  useEffect(() => {
    if (hasUnsavedChanges && (selectedNoteId || isCreating)) {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current)
      }

      autoSaveTimerRef.current = setTimeout(() => {
        handleSave(true)
      }, 30000)
    }

    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasUnsavedChanges, content, title, selectedNoteId, isCreating])

  // Load all notes for current category
  const loadNotes = async () => {
    try {
      setLoading(true)
      const response = await journalService.list(entryType)
      const filteredNotes = response.entries.filter((e) => e.entry_type === entryType)
      setNotes(filteredNotes)
      
      // Select the most recent note if available
      if (filteredNotes.length > 0) {
        selectNote(filteredNotes[0])
      } else {
        clearEditor()
      }
    } catch (err) {
      console.error('Error loading notes:', err)
      toast({
        title: 'Failed to load notes',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  // Select a note and load it into editor
  const selectNote = (note: JournalEntry) => {
    setSelectedNoteId(note.id)
    setIsCreating(false)
    setTitle(note.title || '')
    
    // Extract text content from the first text block
    const textBlock = note.content?.find((b: JournalBlock) => b.type === 'text')
    if (textBlock) {
      const textContent = textBlock.content as TextBlockContent
      setContent(textContent.text || '')
    } else {
      setContent('')
    }
    setHasUnsavedChanges(false)
  }

  // Clear editor for new note
  const clearEditor = () => {
    setSelectedNoteId(null)
    setIsCreating(false)
    setTitle('')
    setContent('')
    setHasUnsavedChanges(false)
  }

  // Start creating a new note
  const handleNewNote = async () => {
    // Save current note if unsaved
    if (hasUnsavedChanges) {
      await handleSave(true)
    }
    
    setSelectedNoteId(null)
    setIsCreating(true)
    setTitle('')
    setContent('')
    setHasUnsavedChanges(false)
  }

  // Handle note selection with auto-save
  const handleSelectNote = async (note: JournalEntry) => {
    if (note.id === selectedNoteId) return
    
    // Save current note if unsaved
    if (hasUnsavedChanges) {
      await handleSave(true)
    }
    
    selectNote(note)
  }

  // Handle title/content changes
  const handleTitleChange = (newTitle: string) => {
    setTitle(newTitle)
    setHasUnsavedChanges(true)
  }

  const handleContentChange = (newContent: string) => {
    setContent(newContent)
    setHasUnsavedChanges(true)
  }

  // Handle save
  const handleSave = async (isAutoSave = false) => {
    if (!title.trim() && !content.trim()) {
      if (!isAutoSave) {
        toast({
          title: 'Missing content',
          description: 'Please add a title or content',
          variant: 'destructive',
        })
      }
      return
    }

    try {
      setSaving(true)

      // Build block structure for the API
      const blocks: JournalBlock[] = [
        {
          id: 'text-1',
          type: 'text',
          order: 0,
          content: { text: content } as TextBlockContent,
        },
      ]

      if (selectedNoteId && !isCreating) {
        // Update existing note
        await journalService.update(selectedNoteId, {
          title: title.trim() || undefined,
          blocks: blocks,
        })
        
        // Update note in local state
        setNotes(prev => prev.map(n => 
          n.id === selectedNoteId 
            ? { ...n, title: title.trim() || undefined, updated_at: new Date().toISOString() }
            : n
        ))
      } else {
        // Create new note
        const response = await journalService.create({
          entry_type: entryType,
          title: title.trim() || undefined,
          blocks: blocks,
        })
        
        // Add new note to list and select it
        const newNote = response.entry
        setNotes(prev => [newNote, ...prev])
        setSelectedNoteId(newNote.id)
        setIsCreating(false)
      }

      setHasUnsavedChanges(false)
      setLastSaved(new Date())
      if (!isAutoSave) {
        toast({
          title: 'Saved!',
        })
      }
    } catch (err) {
      console.error('Error saving:', err)
      if (!isAutoSave) {
        toast({
          title: 'Failed to save',
          variant: 'destructive',
        })
      }
    } finally {
      setSaving(false)
    }
  }

  // Handle delete
  const handleDelete = async () => {
    if (!selectedNoteId) return
    
    try {
      await journalService.delete(selectedNoteId)
      
      // Remove from list
      const updatedNotes = notes.filter(n => n.id !== selectedNoteId)
      setNotes(updatedNotes)
      
      // Select next note or clear
      if (updatedNotes.length > 0) {
        selectNote(updatedNotes[0])
      } else {
        clearEditor()
      }
      
      toast({
        title: 'Note deleted',
      })
    } catch (err) {
      console.error('Error deleting:', err)
      toast({
        title: 'Failed to delete',
        variant: 'destructive',
      })
    } finally {
      setDeleteDialogOpen(false)
    }
  }

  // Handle entry type change
  const handleEntryTypeChange = async (newType: JournalEntryType) => {
    if (newType === entryType) return
    
    // Save current note if unsaved
    if (hasUnsavedChanges) {
      await handleSave(true)
    }
    setEntryType(newType)
  }

  // Format last saved time
  const formatLastSaved = (date: Date): string => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  // Format date for note preview
  const formatNoteDate = (dateStr: string): string => {
    const date = new Date(dateStr)
    const now = new Date()
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))
    
    if (diffDays === 0) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    } else if (diffDays === 1) {
      return 'Yesterday'
    } else if (diffDays < 7) {
      return date.toLocaleDateString([], { weekday: 'short' })
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' })
    }
  }

  // Get preview text for a note
  const getNotePreview = (note: JournalEntry): string => {
    const textBlock = note.content?.find((b: JournalBlock) => b.type === 'text')
    if (textBlock) {
      const textContent = textBlock.content as TextBlockContent
      const text = textContent.text || ''
      return text.slice(0, 50) + (text.length > 50 ? '...' : '')
    }
    return 'No content'
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="flex h-[80vh] max-h-[700px] max-w-4xl flex-col p-0">
          <DialogHeader className="border-b px-6 py-4">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={onBack} className="h-8 w-8">
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div className="flex-1">
                <DialogTitle>Creative Studio</DialogTitle>
                <DialogDescription>Your personal scratchpad for ideas</DialogDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleNewNote}
                className="gap-1.5"
              >
                <Plus className="h-3.5 w-3.5" />
                New Note
              </Button>
              <div className="flex items-center gap-2">
                {lastSaved && (
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    Saved at {formatLastSaved(lastSaved)}
                  </span>
                )}
                {hasUnsavedChanges && (
                  <Badge variant="outline" className="text-xs">
                    Unsaved
                  </Badge>
                )}
              </div>
            </div>
          </DialogHeader>

          {/* Category Tabs */}
          <div className="flex gap-2 border-b bg-muted/30 px-6 py-3">
            {QUICK_START_TEMPLATES.map((template) => {
              const Icon = template.icon
              return (
                <Button
                  key={template.id}
                  variant={entryType === template.id ? 'default' : 'outline'}
                  size="sm"
                  className="gap-1.5"
                  onClick={() => handleEntryTypeChange(template.id)}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {template.label}
                </Button>
              )
            })}
          </div>

          <div className="flex flex-1 overflow-hidden">
            {/* Notes List Sidebar */}
            <div className="w-56 border-r bg-muted/20">
              <ScrollArea className="h-full">
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                  </div>
                ) : notes.length === 0 && !isCreating ? (
                  <div className="p-4 text-center">
                    <p className="text-sm text-muted-foreground">No notes yet</p>
                    <Button
                      variant="link"
                      size="sm"
                      onClick={handleNewNote}
                      className="mt-1"
                    >
                      Create one
                    </Button>
                  </div>
                ) : (
                  <div className="p-2">
                    {isCreating && (
                      <div
                        className={cn(
                          'mb-1 cursor-pointer rounded-md p-3 transition-colors',
                          'bg-primary/10 border border-primary/20'
                        )}
                      >
                        <p className="truncate text-sm font-medium">
                          {title || 'New Note'}
                        </p>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          Creating...
                        </p>
                      </div>
                    )}
                    {notes.map((note) => (
                      <div
                        key={note.id}
                        onClick={() => handleSelectNote(note)}
                        className={cn(
                          'mb-1 cursor-pointer rounded-md p-3 transition-colors hover:bg-muted',
                          selectedNoteId === note.id && !isCreating && 'bg-muted'
                        )}
                      >
                        <p className="truncate text-sm font-medium">
                          {note.title || 'Untitled Note'}
                        </p>
                        <p className="mt-0.5 truncate text-xs text-muted-foreground">
                          {formatNoteDate(note.updated_at)} • {getNotePreview(note)}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </div>

            {/* Editor */}
            <div className="flex flex-1 flex-col overflow-hidden">
              <div className="flex flex-1 flex-col overflow-hidden p-6">
                {loading ? (
                  <div className="flex flex-1 items-center justify-center">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : !selectedNoteId && !isCreating ? (
                  <div className="flex flex-1 flex-col items-center justify-center text-muted-foreground">
                    <FileText className="mb-2 h-12 w-12 opacity-50" />
                    <p>Select a note or create a new one</p>
                  </div>
                ) : (
                  <>
                    {/* Title Input */}
                    <Input
                      value={title}
                      onChange={(e) => handleTitleChange(e.target.value)}
                      placeholder="Untitled Note"
                      className="mb-4 border-none p-0 text-xl font-semibold shadow-none focus-visible:ring-0"
                    />

                    {/* Content Textarea */}
                    <Textarea
                      value={content}
                      onChange={(e) => handleContentChange(e.target.value)}
                      placeholder="Start writing your ideas..."
                      className="flex-1 resize-none border-none text-base shadow-none focus-visible:ring-0"
                    />
                  </>
                )}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between border-t bg-muted/30 px-6 py-3">
                <p className="text-xs text-muted-foreground">
                  {content.length} characters • Auto-saves every 30 seconds
                </p>
                <div className="flex gap-2">
                  {selectedNoteId && !isCreating && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setDeleteDialogOpen(true)}
                      className="text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="mr-2 h-3.5 w-3.5" />
                      Delete
                    </Button>
                  )}
                  <Button
                    onClick={() => handleSave(false)}
                    disabled={saving || loading || (!title.trim() && !content.trim())}
                    size="sm"
                  >
                    {saving ? (
                      <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Save className="mr-2 h-3.5 w-3.5" />
                    )}
                    Save
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Note</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this note? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

export default CreativeStudioModal
