/**
 * TrackUploadModal Component
 * Modal for uploading tracks to the artist's portfolio
 * with metadata (title, genre)
 */

import { useState, useRef } from 'react'
import { Music, Upload, Loader2, X } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { tracksService } from '@/services/api'
import { useToast } from '@/hooks/use-toast'

const GENRES = [
  'Rock',
  'Pop',
  'Hip Hop',
  'R&B',
  'Jazz',
  'Classical',
  'Electronic',
  'Country',
  'Folk',
  'Blues',
  'Metal',
  'Indie',
  'Other',
]

const ACCEPTED_AUDIO_TYPES = '.mp3,.wav,.flac,.m4a,.aac,.ogg'
const MAX_FILE_SIZE_MB = 50
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024

interface TrackUploadModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function TrackUploadModal({ open, onOpenChange, onSuccess }: TrackUploadModalProps) {
  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Form state
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [title, setTitle] = useState('')
  const [genre, setGenre] = useState('')
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Reset form when modal closes
  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      resetForm()
    }
    onOpenChange(isOpen)
  }

  const resetForm = () => {
    setSelectedFile(null)
    setTitle('')
    setGenre('')
    setError(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  // Handle file selection
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    console.log('TrackUploadModal: File selected', { 
      name: file.name, 
      size: file.size, 
      type: file.type 
    })

    // Validate file type
    const validTypes = ['audio/mpeg', 'audio/wav', 'audio/flac', 'audio/x-m4a', 'audio/aac', 'audio/ogg']
    if (!validTypes.some(type => file.type.includes(type.split('/')[1])) && !file.name.match(/\.(mp3|wav|flac|m4a|aac|ogg)$/i)) {
      setError('Please select a valid audio file (MP3, WAV, FLAC, M4A, AAC, or OGG)')
      return
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE_BYTES) {
      setError(`File size must be less than ${MAX_FILE_SIZE_MB}MB`)
      return
    }

    setSelectedFile(file)
    setError(null)

    // Auto-fill title from filename (without extension)
    if (!title) {
      const nameWithoutExt = file.name.replace(/\.[^/.]+$/, '')
      setTitle(nameWithoutExt)
    }
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedFile) {
      setError('Please select an audio file')
      return
    }

    if (!title.trim()) {
      setError('Please enter a track title')
      return
    }

    if (!genre) {
      setError('Please select a genre')
      return
    }

    console.log('TrackUploadModal: Starting upload', { 
      title, 
      genre, 
      fileName: selectedFile.name 
    })

    setIsUploading(true)
    setError(null)

    try {
      await tracksService.upload(selectedFile, {
        title: title.trim(),
        genre,
      })

      console.log('TrackUploadModal: Upload successful')

      toast({
        title: 'Track uploaded!',
        description: `"${title}" has been added to your portfolio.`,
      })

      handleOpenChange(false)
      onSuccess?.()
    } catch (err) {
      console.error('TrackUploadModal: Upload failed', err)
      const errorMessage = err instanceof Error ? err.message : 'Failed to upload track'
      setError(errorMessage)
      toast({
        title: 'Upload failed',
        description: errorMessage,
        variant: 'destructive',
      })
    } finally {
      setIsUploading(false)
    }
  }

  // Format file size for display
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Music className="h-5 w-5 text-purple-500" />
            Upload Track
          </DialogTitle>
          <DialogDescription>
            Add a track to your portfolio. Supported formats: MP3, WAV, FLAC, M4A.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* File Upload Area */}
          <div className="space-y-2">
            <Label htmlFor="audio-file">Audio File</Label>
            <div
              onClick={() => fileInputRef.current?.click()}
              className={`
                relative cursor-pointer rounded-lg border-2 border-dashed p-6 text-center transition-colors
                ${selectedFile 
                  ? 'border-purple-500 bg-purple-50 dark:bg-purple-950/20' 
                  : 'border-muted-foreground/25 hover:border-purple-500/50 hover:bg-muted/50'
                }
              `}
            >
              <input
                ref={fileInputRef}
                id="audio-file"
                type="file"
                accept={ACCEPTED_AUDIO_TYPES}
                onChange={handleFileSelect}
                className="hidden"
                disabled={isUploading}
              />
              
              {selectedFile ? (
                <div className="flex items-center justify-center gap-3">
                  <Music className="h-8 w-8 text-purple-500" />
                  <div className="text-left">
                    <p className="font-medium text-foreground">{selectedFile.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatFileSize(selectedFile.size)}
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="ml-2"
                    onClick={(e) => {
                      e.stopPropagation()
                      setSelectedFile(null)
                      if (fileInputRef.current) fileInputRef.current.value = ''
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <>
                  <Upload className="mx-auto mb-2 h-8 w-8 text-muted-foreground" />
                  <p className="text-sm font-medium">Click to select audio file</p>
                  <p className="text-xs text-muted-foreground">
                    Max {MAX_FILE_SIZE_MB}MB
                  </p>
                </>
              )}
            </div>
          </div>

          {/* Title Input */}
          <div className="space-y-2">
            <Label htmlFor="title">Track Title</Label>
            <Input
              id="title"
              placeholder="Enter track title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={isUploading}
              maxLength={100}
            />
          </div>

          {/* Genre Select */}
          <div className="space-y-2">
            <Label htmlFor="genre">Genre</Label>
            <Select value={genre} onValueChange={setGenre} disabled={isUploading}>
              <SelectTrigger id="genre">
                <SelectValue placeholder="Select a genre" />
              </SelectTrigger>
              <SelectContent>
                {GENRES.map((g) => (
                  <SelectItem key={g} value={g.toLowerCase()}>
                    {g}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Error Message */}
          {error && (
            <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={isUploading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isUploading || !selectedFile || !title.trim() || !genre}
              className="bg-purple-500 hover:bg-purple-600"
            >
              {isUploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Track
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

