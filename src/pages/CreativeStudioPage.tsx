/**
 * Creative Studio Page (Journal)
 * Block-based editor for song ideas, set planning, and general notes
 * Implements task-8.5: Creative Studio page with auto-save
 */

import { useState, useEffect, useRef } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { toast } from 'sonner'
import {
  Type,
  Image as ImageIcon,
  Video,
  CheckSquare,
  Plus,
  Trash2,
  GripVertical,
  Save,
  Upload,
  Clock,
  Music,
  Calendar,
  FileText,
} from 'lucide-react'
import AppLayout from '@/components/layout/AppLayout'
import LoadingState from '@/components/common/LoadingState'
import ErrorState from '@/components/common/ErrorState'
import { journalService, filesService } from '@/services/api'
import type {
  JournalEntry,
  JournalEntryType,
  JournalBlock,
  JournalBlockType,
  TextBlockContent,
  ImageBlockContent,
  AudioVideoBlockContent,
  ChecklistBlockContent,
  ChecklistItem,
} from '@/types'

// Generate unique IDs for blocks and checklist items
const generateId = () => Math.random().toString(36).substring(2, 11)

// Tab configuration
const entryTypeTabs = [
  { value: 'song_idea' as JournalEntryType, label: 'Song Ideas', icon: Music },
  { value: 'set_plan' as JournalEntryType, label: 'Set Planning', icon: Calendar },
  { value: 'general_note' as JournalEntryType, label: 'General Notes', icon: FileText },
]

// Block type configuration
const blockTypes = [
  { type: 'text' as JournalBlockType, label: 'Text', icon: Type },
  { type: 'image' as JournalBlockType, label: 'Image', icon: ImageIcon },
  { type: 'audio' as JournalBlockType, label: 'Audio/Video', icon: Video },
  { type: 'checklist' as JournalBlockType, label: 'Checklist', icon: CheckSquare },
]

export default function CreativeStudioPage() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [entries, setEntries] = useState<JournalEntry[]>([])
  const [currentEntryType, setCurrentEntryType] = useState<JournalEntryType>('song_idea')
  const [currentEntry, setCurrentEntry] = useState<JournalEntry | null>(null)
  const [blocks, setBlocks] = useState<JournalBlock[]>([])
  const [title, setTitle] = useState('')
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [autoSaveTime, setAutoSaveTime] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null)

  // Load entries on mount
  useEffect(() => {
    loadEntries()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Auto-save functionality (every 30 seconds)
  useEffect(() => {
    if (hasUnsavedChanges && currentEntry) {
      // Clear existing timer
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current)
      }

      // Set new timer for 30 seconds
      autoSaveTimerRef.current = setTimeout(() => {
        handleAutoSave()
      }, 30000)
    }

    // Cleanup timer on unmount
    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current)
      }
    }
  }, [hasUnsavedChanges, blocks, title, currentEntry])

  // Load all entries
  const loadEntries = async () => {
    try {
      setLoading(true)
      const response = await journalService.list()
      setEntries(response.entries)
      setError(null)

      // Load the first entry for current type or create new
      const existingEntry = response.entries.find(
        (e) => e.entry_type === currentEntryType
      )
      if (existingEntry) {
        loadEntry(existingEntry)
      } else {
        createNewEntry()
      }
    } catch (err) {
      setError(err as Error)
    } finally {
      setLoading(false)
    }
  }

  // Load a specific entry
  const loadEntry = (entry: JournalEntry) => {
    setCurrentEntry(entry)
    setTitle(entry.title || '')
    setBlocks(entry.content || [])
    setHasUnsavedChanges(false)
  }

  // Create new entry in memory
  const createNewEntry = () => {
    setCurrentEntry(null)
    setTitle('')
    setBlocks([])
    setHasUnsavedChanges(false)
  }

  // Handle entry type tab change
  const handleTabChange = (newType: string) => {
    const entryType = newType as JournalEntryType
    setCurrentEntryType(entryType)

    // Find entry for this type
    const existingEntry = entries.find((e) => e.entry_type === entryType)
    if (existingEntry) {
      loadEntry(existingEntry)
    } else {
      createNewEntry()
    }
  }

  // Add a new block
  const addBlock = (type: JournalBlockType) => {
    const newBlock: JournalBlock = {
      id: generateId(),
      type,
      order: blocks.length,
      content: getDefaultContent(type),
    }

    setBlocks([...blocks, newBlock])
    setHasUnsavedChanges(true)
  }

  // Get default content for block type
  const getDefaultContent = (type: JournalBlockType): any => {
    switch (type) {
      case 'text':
        return { text: '' } as TextBlockContent
      case 'image':
        return { url: '', caption: '' } as ImageBlockContent
      case 'audio':
      case 'video':
        return { url: '', type: 'audio', title: '' } as AudioVideoBlockContent
      case 'checklist':
        return { items: [] } as ChecklistBlockContent
      default:
        return {}
    }
  }

  // Update block content
  const updateBlock = (blockId: string, content: any) => {
    setBlocks(
      blocks.map((block) =>
        block.id === blockId ? { ...block, content } : block
      )
    )
    setHasUnsavedChanges(true)
  }

  // Delete a block
  const deleteBlock = (blockId: string) => {
    setBlocks(blocks.filter((block) => block.id !== blockId))
    setHasUnsavedChanges(true)
  }

  // Move block up
  const moveBlockUp = (index: number) => {
    if (index === 0) return
    const newBlocks = [...blocks]
    const temp = newBlocks[index - 1]
    newBlocks[index - 1] = newBlocks[index]
    newBlocks[index] = temp
    // Update order
    newBlocks.forEach((block, i) => {
      block.order = i
    })
    setBlocks(newBlocks)
    setHasUnsavedChanges(true)
  }

  // Move block down
  const moveBlockDown = (index: number) => {
    if (index === blocks.length - 1) return
    const newBlocks = [...blocks]
    const temp = newBlocks[index + 1]
    newBlocks[index + 1] = newBlocks[index]
    newBlocks[index] = temp
    // Update order
    newBlocks.forEach((block, i) => {
      block.order = i
    })
    setBlocks(newBlocks)
    setHasUnsavedChanges(true)
  }

  // Auto-save
  const handleAutoSave = async () => {
    if (!currentEntry || isSaving) return

    try {
      setIsSaving(true)
      await journalService.update(currentEntry.id, {
        title,
        blocks,
      })
      setHasUnsavedChanges(false)
      const now = new Date().toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
      })
      setAutoSaveTime(now)
    } catch (err) {
      console.error('Auto-save failed:', err)
    } finally {
      setIsSaving(false)
    }
  }

  // Manual save
  const handleSave = async () => {
    try {
      setIsSaving(true)

      if (currentEntry) {
        // Update existing entry
        const response = await journalService.update(currentEntry.id, {
          title,
          blocks,
        })
        setCurrentEntry(response.entry)
        toast.success('Entry saved successfully')
      } else {
        // Create new entry
        const response = await journalService.create({
          entry_type: currentEntryType,
          title,
          blocks,
        })
        setCurrentEntry(response.entry)
        setEntries([...entries, response.entry])
        toast.success('Entry created successfully')
      }

      setHasUnsavedChanges(false)
      const now = new Date().toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
      })
      setAutoSaveTime(now)
    } catch (err) {
      toast.error('Failed to save entry')
      console.error('Save failed:', err)
    } finally {
      setIsSaving(false)
    }
  }

  // Handle file upload
  const handleFileUpload = async (
    file: File,
    blockId: string,
    blockType: 'image' | 'audio' | 'video'
  ) => {
    try {
      const uploadResponse = await filesService.upload(file)
      const block = blocks.find((b) => b.id === blockId)

      if (block) {
        if (blockType === 'image') {
          updateBlock(blockId, {
            url: uploadResponse.file.url,
            caption: (block.content as ImageBlockContent).caption || '',
            file_id: uploadResponse.file.id,
          } as ImageBlockContent)
        } else {
          updateBlock(blockId, {
            url: uploadResponse.file.url,
            type: blockType,
            title: (block.content as AudioVideoBlockContent).title || file.name,
            file_id: uploadResponse.file.id,
          } as AudioVideoBlockContent)
        }
      }

      toast.success('File uploaded successfully')
    } catch (err) {
      toast.error('Failed to upload file')
      console.error('Upload failed:', err)
    }
  }

  if (!user) return null

  if (loading) {
    return (
      <AppLayout>
        <LoadingState message="Loading Creative Studio..." />
      </AppLayout>
    )
  }

  if (error) {
    return (
      <AppLayout>
        <ErrorState error={error} retry={loadEntries} />
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Page Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight">Creative Studio</h1>
          <p className="text-muted-foreground">
            Capture your musical ideas, plan your sets, and keep notes
          </p>
        </div>

        {/* Entry Type Tabs */}
        <Tabs value={currentEntryType} onValueChange={handleTabChange}>
          <TabsList className="grid w-full grid-cols-3 mb-6">
            {entryTypeTabs.map((tab) => (
              <TabsTrigger key={tab.value} value={tab.value} className="gap-2">
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>

          {entryTypeTabs.map((tab) => (
            <TabsContent key={tab.value} value={tab.value}>
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>
                      <Input
                        value={title}
                        onChange={(e) => {
                          setTitle(e.target.value)
                          setHasUnsavedChanges(true)
                        }}
                        placeholder={`${tab.label} title...`}
                        className="text-2xl font-bold border-0 px-0 focus-visible:ring-0"
                      />
                    </CardTitle>
                    {autoSaveTime && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        Auto-saved at {autoSaveTime}
                      </div>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="space-y-6">
                  {/* Toolbar */}
                  <div className="border-b pb-4">
                    <Label className="text-sm font-medium mb-2 block">
                      Add Block
                    </Label>
                    <div className="flex flex-wrap gap-2">
                      {blockTypes.map((blockType) => (
                        <Button
                          key={blockType.type}
                          variant="outline"
                          size="sm"
                          onClick={() => addBlock(blockType.type)}
                        >
                          <blockType.icon className="h-4 w-4 mr-2" />
                          {blockType.label}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Blocks */}
                  <div className="space-y-4">
                    {blocks.length === 0 ? (
                      <div className="text-center py-12 text-muted-foreground">
                        <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>No blocks yet. Add your first block above!</p>
                      </div>
                    ) : (
                      blocks.map((block, index) => (
                        <BlockEditor
                          key={block.id}
                          block={block}
                          index={index}
                          totalBlocks={blocks.length}
                          onUpdate={(content) => updateBlock(block.id, content)}
                          onDelete={() => deleteBlock(block.id)}
                          onMoveUp={() => moveBlockUp(index)}
                          onMoveDown={() => moveBlockDown(index)}
                          onFileUpload={(file, type) =>
                            handleFileUpload(file, block.id, type)
                          }
                        />
                      ))
                    )}
                  </div>

                  {/* Footer */}
                  <div className="border-t pt-4 flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                      {blocks.length} {blocks.length === 1 ? 'block' : 'blocks'}
                    </div>
                    <Button
                      onClick={handleSave}
                      disabled={isSaving || !hasUnsavedChanges}
                    >
                      <Save className="h-4 w-4 mr-2" />
                      {isSaving ? 'Saving...' : 'Save Entry'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </AppLayout>
  )
}

// Block Editor Component
interface BlockEditorProps {
  block: JournalBlock
  index: number
  totalBlocks: number
  onUpdate: (content: any) => void
  onDelete: () => void
  onMoveUp: () => void
  onMoveDown: () => void
  onFileUpload: (file: File, type: 'image' | 'audio' | 'video') => void
}

function BlockEditor({
  block,
  index,
  totalBlocks,
  onUpdate,
  onDelete,
  onMoveUp,
  onMoveDown,
  onFileUpload,
}: BlockEditorProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex gap-4">
          {/* Drag Handle & Controls */}
          <div className="flex flex-col gap-2 items-center">
            <GripVertical className="h-5 w-5 text-muted-foreground cursor-grab" />
            <div className="flex flex-col gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={onMoveUp}
                disabled={index === 0}
              >
                ↑
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={onMoveDown}
                disabled={index === totalBlocks - 1}
              >
                ↓
              </Button>
            </div>
          </div>

          {/* Block Content */}
          <div className="flex-1">
            {block.type === 'text' && (
              <TextBlock content={block.content} onUpdate={onUpdate} />
            )}
            {block.type === 'image' && (
              <ImageBlock
                content={block.content}
                onUpdate={onUpdate}
                onFileUpload={(file) => onFileUpload(file, 'image')}
                fileInputRef={fileInputRef}
              />
            )}
            {(block.type === 'audio' || block.type === 'video') && (
              <AudioVideoBlock
                content={block.content}
                onUpdate={onUpdate}
                onFileUpload={(file, type) => onFileUpload(file, type)}
                fileInputRef={fileInputRef}
              />
            )}
            {block.type === 'checklist' && (
              <ChecklistBlock content={block.content} onUpdate={onUpdate} />
            )}
          </div>

          {/* Delete Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onDelete}
            className="text-destructive hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

// Text Block Component
function TextBlock({
  content,
  onUpdate,
}: {
  content: TextBlockContent
  onUpdate: (content: TextBlockContent) => void
}) {
  return (
    <Textarea
      value={content.text || ''}
      onChange={(e) => onUpdate({ text: e.target.value })}
      placeholder="Write your text here..."
      className="min-h-[120px]"
    />
  )
}

// Image Block Component
function ImageBlock({
  content,
  onUpdate,
  onFileUpload,
  fileInputRef,
}: {
  content: ImageBlockContent
  onUpdate: (content: ImageBlockContent) => void
  onFileUpload: (file: File) => void
  fileInputRef: React.RefObject<HTMLInputElement>
}) {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && file.type.startsWith('image/')) {
      onFileUpload(file)
    } else {
      toast.error('Please select a valid image file')
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <Input
          value={content.url || ''}
          onChange={(e) => onUpdate({ ...content, url: e.target.value })}
          placeholder="Image URL or upload..."
          className="flex-1"
        />
        <Button
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload className="h-4 w-4 mr-2" />
          Upload
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>
      {content.url && (
        <img
          src={content.url}
          alt={content.caption || 'Image'}
          className="max-w-full h-auto rounded-md"
        />
      )}
      <Input
        value={content.caption || ''}
        onChange={(e) => onUpdate({ ...content, caption: e.target.value })}
        placeholder="Caption (optional)"
      />
    </div>
  )
}

// Audio/Video Block Component
function AudioVideoBlock({
  content,
  onUpdate,
  onFileUpload,
  fileInputRef,
}: {
  content: AudioVideoBlockContent
  onUpdate: (content: AudioVideoBlockContent) => void
  onFileUpload: (file: File, type: 'audio' | 'video') => void
  fileInputRef: React.RefObject<HTMLInputElement>
}) {
  const [mediaType, setMediaType] = useState<'audio' | 'video'>(
    content.type || 'audio'
  )

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const isAudio = file.type.startsWith('audio/')
      const isVideo = file.type.startsWith('video/')

      if (isAudio || isVideo) {
        const type = isAudio ? 'audio' : 'video'
        setMediaType(type)
        onFileUpload(file, type)
      } else {
        toast.error('Please select a valid audio or video file')
      }
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <Input
          value={content.url || ''}
          onChange={(e) =>
            onUpdate({ ...content, url: e.target.value, type: mediaType })
          }
          placeholder="Media URL or upload..."
          className="flex-1"
        />
        <Button
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload className="h-4 w-4 mr-2" />
          Upload
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept="audio/*,video/*"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>
      {content.url && (
        <div>
          {mediaType === 'audio' ? (
            <audio controls className="w-full">
              <source src={content.url} />
            </audio>
          ) : (
            <video controls className="w-full max-h-[400px]">
              <source src={content.url} />
            </video>
          )}
        </div>
      )}
      <Input
        value={content.title || ''}
        onChange={(e) => onUpdate({ ...content, title: e.target.value })}
        placeholder="Title (optional)"
      />
    </div>
  )
}

// Checklist Block Component
function ChecklistBlock({
  content,
  onUpdate,
}: {
  content: ChecklistBlockContent
  onUpdate: (content: ChecklistBlockContent) => void
}) {
  const [newItemText, setNewItemText] = useState('')

  const addItem = () => {
    if (newItemText.trim()) {
      const newItem: ChecklistItem = {
        id: generateId(),
        text: newItemText,
        completed: false,
      }
      onUpdate({ items: [...(content.items || []), newItem] })
      setNewItemText('')
    }
  }

  const toggleItem = (itemId: string) => {
    onUpdate({
      items: (content.items || []).map((item) =>
        item.id === itemId ? { ...item, completed: !item.completed } : item
      ),
    })
  }

  const removeItem = (itemId: string) => {
    onUpdate({
      items: (content.items || []).filter((item) => item.id !== itemId),
    })
  }

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <Input
          value={newItemText}
          onChange={(e) => setNewItemText(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && addItem()}
          placeholder="Add a task..."
          className="flex-1"
        />
        <Button variant="outline" size="sm" onClick={addItem}>
          <Plus className="h-4 w-4 mr-2" />
          Add
        </Button>
      </div>
      <div className="space-y-2">
        {(content.items || []).map((item) => (
          <div key={item.id} className="flex items-center gap-2">
            <Checkbox
              checked={item.completed}
              onCheckedChange={() => toggleItem(item.id)}
            />
            <span
              className={`flex-1 ${
                item.completed ? 'line-through text-muted-foreground' : ''
              }`}
            >
              {item.text}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => removeItem(item.id)}
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
        {(content.items || []).length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-4">
            No tasks yet. Add one above!
          </p>
        )}
      </div>
    </div>
  )
}
