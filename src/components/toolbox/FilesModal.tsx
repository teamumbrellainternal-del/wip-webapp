/**
 * FilesModal Component
 * Simplified file manager for the artist toolbox
 */

import { useState, useEffect, useCallback, useRef } from 'react'
import {
  ArrowLeft,
  Upload,
  Search,
  LayoutGrid,
  List,
  MoreVertical,
  FileText,
  Music,
  Video,
  Image as ImageIcon,
  Trash2,
  FolderOpen,
  Loader2,
  X,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
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
import { filesService } from '@/services/api'
import type { FileMetadata } from '@/types'
import { cn } from '@/lib/utils'
import { useToast } from '@/hooks/use-toast'

const STORAGE_QUOTA_GB = 50
const BYTES_PER_GB = 1024 * 1024 * 1024

const FILE_CATEGORIES = [
  { id: 'all', label: 'All', icon: FolderOpen },
  { id: 'image', label: 'Photos', icon: ImageIcon },
  { id: 'audio', label: 'Audio', icon: Music },
  { id: 'video', label: 'Video', icon: Video },
  { id: 'document', label: 'Docs', icon: FileText },
] as const

type CategoryId = (typeof FILE_CATEGORIES)[number]['id']
type ViewMode = 'grid' | 'list'

interface FilesModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onBack: () => void
}

export function FilesModal({ open, onOpenChange, onBack }: FilesModalProps) {
  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)

  // State
  const [files, setFiles] = useState<FileMetadata[]>([])
  const [storageUsed, setStorageUsed] = useState(0)
  const [storageTotal] = useState(STORAGE_QUOTA_GB * BYTES_PER_GB)
  const [selectedCategory, setSelectedCategory] = useState<CategoryId>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)

  // Delete dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedFile, setSelectedFile] = useState<FileMetadata | null>(null)

  // Preview modal state
  const [previewFile, setPreviewFile] = useState<FileMetadata | null>(null)

  // Fetch files
  const fetchFiles = useCallback(async () => {
    try {
      setLoading(true)
      // The list endpoint returns files and storage info together
      const filesResponse = (await filesService.list()) as unknown as {
        files: Array<{
          id: string
          filename: string
          mime_type: string
          file_size_bytes: number
          r2_key: string
          category: string
          created_at: string
        }>
        storageUsed: number
        storageQuota: number
      }

      // Map backend response to FileMetadata format
      const mappedFiles: FileMetadata[] = (filesResponse.files || []).map((f) => ({
        id: f.id,
        filename: f.filename,
        file_type: f.mime_type,
        file_size: f.file_size_bytes,
        url: `/media/${f.r2_key}`,
        uploaded_at: f.created_at,
      }))

      setFiles(mappedFiles)
      setStorageUsed(filesResponse.storageUsed || 0)
    } catch (err) {
      console.error('Error fetching files:', err)
      toast({
        title: 'Failed to load files',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (open) {
      fetchFiles()
    }
  }, [open, fetchFiles])

  // Filter files
  const filteredFiles = files.filter((file) => {
    let matchesCategory = true
    if (selectedCategory !== 'all') {
      const fileType = file.file_type.toLowerCase()
      switch (selectedCategory) {
        case 'image':
          matchesCategory = fileType.startsWith('image/')
          break
        case 'audio':
          matchesCategory = fileType.startsWith('audio/')
          break
        case 'video':
          matchesCategory = fileType.startsWith('video/')
          break
        case 'document':
          matchesCategory =
            fileType.includes('pdf') || fileType.includes('document') || fileType.includes('text')
          break
      }
    }

    const matchesSearch =
      !searchQuery.trim() || file.filename.toLowerCase().includes(searchQuery.toLowerCase())

    return matchesCategory && matchesSearch
  })

  // Handle file upload
  const handleFileUpload = async (uploadFiles: FileList | null) => {
    if (!uploadFiles || uploadFiles.length === 0) return

    setUploading(true)
    try {
      for (let i = 0; i < uploadFiles.length; i++) {
        await filesService.upload(uploadFiles[i])
      }
      await fetchFiles()
      toast({
        title: 'Files uploaded successfully!',
      })
    } catch (err) {
      console.error('Error uploading files:', err)
      toast({
        title: 'Failed to upload files',
        variant: 'destructive',
      })
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  // Handle delete
  const handleDeleteFile = async () => {
    if (!selectedFile) return
    try {
      await filesService.delete(selectedFile.id)
      await fetchFiles()
      toast({
        title: 'File deleted',
      })
      setDeleteDialogOpen(false)
      setSelectedFile(null)
    } catch (err) {
      console.error('Error deleting file:', err)
      toast({
        title: 'Failed to delete file',
        variant: 'destructive',
      })
    }
  }

  // Helpers
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
    return (bytes / (1024 * 1024 * 1024)).toFixed(1) + ' GB'
  }

  const getFileIcon = (fileType: string) => {
    const type = fileType.toLowerCase()
    if (type.startsWith('image/')) return ImageIcon
    if (type.startsWith('audio/')) return Music
    if (type.startsWith('video/')) return Video
    return FileText
  }

  const storagePercentage = (storageUsed / storageTotal) * 100

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
                <DialogTitle>My Files</DialogTitle>
                <DialogDescription>
                  {formatFileSize(storageUsed)} / {STORAGE_QUOTA_GB}GB used
                </DialogDescription>
              </div>
              <Button size="sm" onClick={() => fileInputRef.current?.click()} disabled={uploading}>
                {uploading ? (
                  <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Upload className="mr-2 h-3.5 w-3.5" />
                )}
                Upload
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                className="hidden"
                onChange={(e) => handleFileUpload(e.target.files)}
              />
            </div>
            <Progress value={storagePercentage} className="mt-3 h-1.5" />
          </DialogHeader>

          <div className="flex flex-1 overflow-hidden">
            {/* Left Panel - Categories */}
            <div className="flex w-44 flex-col border-r bg-muted/30 p-2">
              {FILE_CATEGORIES.map((category) => {
                const Icon = category.icon
                return (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={cn(
                      'mb-1 flex items-center gap-2 rounded-md px-2.5 py-1.5 text-xs transition-colors',
                      selectedCategory === category.id
                        ? 'bg-primary text-primary-foreground'
                        : 'hover:bg-muted'
                    )}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    <span>{category.label}</span>
                  </button>
                )
              })}
            </div>

            {/* Main Content */}
            <div className="flex flex-1 flex-col overflow-hidden">
              {/* Toolbar */}
              <div className="flex items-center gap-2 border-b p-3">
                <div className="relative flex-1">
                  <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search files..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="h-8 pl-8 text-sm"
                  />
                </div>
                <div className="flex items-center rounded-md border p-0.5">
                  <Button
                    variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => setViewMode('grid')}
                  >
                    <LayoutGrid className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => setViewMode('list')}
                  >
                    <List className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>

              {/* Files */}
              <ScrollArea className="flex-1 p-3">
                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : filteredFiles.length === 0 ? (
                  <div className="py-12 text-center">
                    <Upload className="mx-auto mb-3 h-10 w-10 text-muted-foreground/50" />
                    <p className="text-sm font-medium text-muted-foreground">
                      {searchQuery || selectedCategory !== 'all'
                        ? 'No files found'
                        : 'No files yet'}
                    </p>
                    {!searchQuery && selectedCategory === 'all' && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-3"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        Upload Files
                      </Button>
                    )}
                  </div>
                ) : (
                  <div
                    className={cn(
                      viewMode === 'grid'
                        ? 'grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4'
                        : 'space-y-1.5'
                    )}
                  >
                    {filteredFiles.map((file) => {
                      const FileIcon = getFileIcon(file.file_type)
                      const isImage = file.file_type.toLowerCase().startsWith('image/')

                      if (viewMode === 'grid') {
                        return (
                          <Card
                            key={file.id}
                            className="group cursor-pointer overflow-hidden transition-shadow hover:shadow-md"
                            onDoubleClick={() => setPreviewFile(file)}
                            title="Double-click to view"
                          >
                            <CardContent className="p-0">
                              <div className="relative flex aspect-square items-center justify-center bg-muted">
                                {isImage && file.url ? (
                                  <img
                                    src={file.url}
                                    alt={file.filename}
                                    className="h-full w-full object-cover"
                                  />
                                ) : (
                                  <FileIcon className="h-8 w-8 text-muted-foreground" />
                                )}
                                <div className="absolute right-1 top-1 opacity-0 transition-opacity group-hover:opacity-100">
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button variant="secondary" size="icon" className="h-6 w-6">
                                        <MoreVertical className="h-3 w-3" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                      <DropdownMenuItem
                                        onClick={() => {
                                          setSelectedFile(file)
                                          setDeleteDialogOpen(true)
                                        }}
                                        className="text-destructive"
                                      >
                                        <Trash2 className="mr-2 h-3.5 w-3.5" />
                                        Delete
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </div>
                              </div>
                              <div className="p-2">
                                <p className="truncate text-xs font-medium">{file.filename}</p>
                                <p className="text-[10px] text-muted-foreground">
                                  {formatFileSize(file.file_size)}
                                </p>
                              </div>
                            </CardContent>
                          </Card>
                        )
                      }

                      // List view
                      return (
                        <div
                          key={file.id}
                          className="flex cursor-pointer items-center gap-2 rounded-md p-2 hover:bg-muted"
                          onDoubleClick={() => setPreviewFile(file)}
                          title="Double-click to view"
                        >
                          <div className="flex-shrink-0">
                            {isImage && file.url ? (
                              <img
                                src={file.url}
                                alt={file.filename}
                                className="h-8 w-8 rounded object-cover"
                              />
                            ) : (
                              <div className="flex h-8 w-8 items-center justify-center rounded bg-muted">
                                <FileIcon className="h-4 w-4 text-muted-foreground" />
                              </div>
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-xs font-medium">{file.filename}</p>
                            <p className="text-[10px] text-muted-foreground">
                              {formatFileSize(file.file_size)}
                            </p>
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-7 w-7">
                                <MoreVertical className="h-3.5 w-3.5" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => {
                                  setSelectedFile(file)
                                  setDeleteDialogOpen(true)
                                }}
                                className="text-destructive"
                              >
                                <Trash2 className="mr-2 h-3.5 w-3.5" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      )
                    })}
                  </div>
                )}
              </ScrollArea>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete File</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{selectedFile?.filename}"? This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteFile}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* File Preview Modal */}
      <Dialog open={!!previewFile} onOpenChange={(open) => !open && setPreviewFile(null)}>
        <DialogContent className="flex max-h-[90vh] max-w-[90vw] flex-col p-0">
          <DialogHeader className="flex flex-row items-center justify-between border-b px-4 py-3">
            <DialogTitle className="truncate pr-4 text-sm font-medium">
              {previewFile?.filename}
            </DialogTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 shrink-0"
              onClick={() => setPreviewFile(null)}
            >
              <X className="h-4 w-4" />
            </Button>
          </DialogHeader>
          <div className="flex min-h-0 flex-1 items-center justify-center bg-black/5 p-4">
            {previewFile && (
              <>
                {/* Images */}
                {previewFile.file_type.startsWith('image/') && (
                  <img
                    src={previewFile.url}
                    alt={previewFile.filename}
                    className="max-h-[70vh] max-w-full object-contain"
                  />
                )}

                {/* Videos */}
                {previewFile.file_type.startsWith('video/') && (
                  <video
                    src={previewFile.url}
                    controls
                    autoPlay
                    className="max-h-[70vh] max-w-full"
                  >
                    Your browser does not support video playback.
                  </video>
                )}

                {/* Audio */}
                {previewFile.file_type.startsWith('audio/') && (
                  <div className="flex flex-col items-center gap-4 p-8">
                    <Music className="h-16 w-16 text-muted-foreground" />
                    <p className="text-sm font-medium">{previewFile.filename}</p>
                    <audio src={previewFile.url} controls autoPlay className="w-full max-w-md">
                      Your browser does not support audio playback.
                    </audio>
                  </div>
                )}

                {/* PDFs */}
                {previewFile.file_type === 'application/pdf' && (
                  <iframe
                    src={previewFile.url}
                    title={previewFile.filename}
                    className="h-[70vh] w-full"
                  />
                )}

                {/* Text/Markdown files */}
                {previewFile.file_type.startsWith('text/') && (
                  <iframe
                    src={previewFile.url}
                    title={previewFile.filename}
                    className="h-[70vh] w-full bg-white"
                  />
                )}

                {/* Unsupported types - show download link */}
                {!previewFile.file_type.startsWith('image/') &&
                  !previewFile.file_type.startsWith('video/') &&
                  !previewFile.file_type.startsWith('audio/') &&
                  !previewFile.file_type.startsWith('text/') &&
                  previewFile.file_type !== 'application/pdf' && (
                    <div className="flex flex-col items-center gap-4 p-8">
                      <FileText className="h-16 w-16 text-muted-foreground" />
                      <p className="text-sm font-medium">{previewFile.filename}</p>
                      <p className="text-xs text-muted-foreground">
                        Preview not available for this file type
                      </p>
                      <Button
                        variant="outline"
                        onClick={() => window.open(previewFile.url, '_blank')}
                      >
                        Open in New Tab
                      </Button>
                    </div>
                  )}
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default FilesModal
