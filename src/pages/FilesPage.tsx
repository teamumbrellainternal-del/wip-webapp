import { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
import {
  Upload,
  Search,
  LayoutGrid,
  List,
  FolderPlus,
  MoreVertical,
  FileText,
  Music,
  Video,
  Image as ImageIcon,
  Trash2,
  Edit2,
  FolderOpen,
  X,
  ArrowLeft,
  Cloud,
} from 'lucide-react'
import AppLayout from '@/components/layout/AppLayout'
import LoadingState from '@/components/common/LoadingState'
import ErrorState from '@/components/common/ErrorState'
import { filesService } from '@/services/api'
import type { FileMetadata } from '@/types'
import { cn } from '@/lib/utils'

const STORAGE_QUOTA_GB = 50
const BYTES_PER_GB = 1024 * 1024 * 1024

// File type categories
const FILE_CATEGORIES = [
  { id: 'all', label: 'All Files', icon: FolderOpen },
  { id: 'image', label: 'Press Photos', icon: ImageIcon },
  { id: 'audio', label: 'Music & Audio', icon: Music },
  { id: 'video', label: 'Videos', icon: Video },
  { id: 'document', label: 'Documents', icon: FileText },
] as const

type ViewMode = 'grid' | 'list'
type CategoryId = (typeof FILE_CATEGORIES)[number]['id']

export default function FilesPage() {
  const navigate = useNavigate()
  const fileInputRef = useRef<HTMLInputElement>(null)

  // State
  const [files, setFiles] = useState<FileMetadata[]>([])
  const [filteredFiles, setFilteredFiles] = useState<FileMetadata[]>([])
  const [storageUsed, setStorageUsed] = useState(0)
  const [storageTotal] = useState(STORAGE_QUOTA_GB * BYTES_PER_GB)
  const [selectedCategory, setSelectedCategory] = useState<CategoryId>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [isDragging, setIsDragging] = useState(false)

  // Dialog states
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [renameDialogOpen, setRenameDialogOpen] = useState(false)
  const [selectedFile, setSelectedFile] = useState<FileMetadata | null>(null)
  const [newFileName, setNewFileName] = useState('')

  // Fetch files and storage usage
  const fetchFiles = useCallback(async () => {
    try {
      setLoading(true)
      // The list endpoint returns files and storage info together
      const filesResponse = await filesService.list() as unknown as {
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
      setError(null)
    } catch (err) {
      console.error('Error fetching files:', err)
      setError(err as Error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchFiles()
  }, [fetchFiles])

  // Filter files based on category and search query
  useEffect(() => {
    let result = files

    // Filter by category
    if (selectedCategory !== 'all') {
      result = result.filter((file) => {
        const fileType = file.file_type.toLowerCase()
        switch (selectedCategory) {
          case 'image':
            return fileType.startsWith('image/')
          case 'audio':
            return fileType.startsWith('audio/')
          case 'video':
            return fileType.startsWith('video/')
          case 'document':
            return (
              fileType.includes('pdf') ||
              fileType.includes('document') ||
              fileType.includes('text') ||
              fileType.includes('msword') ||
              fileType.includes('wordprocessingml')
            )
          default:
            return true
        }
      })
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      result = result.filter((file) => file.filename.toLowerCase().includes(query))
    }

    setFilteredFiles(result)
  }, [files, selectedCategory, searchQuery])

  // Calculate category counts
  const getCategoryCounts = () => {
    const counts: Record<CategoryId, number> = {
      all: files.length,
      image: 0,
      audio: 0,
      video: 0,
      document: 0,
    }

    files.forEach((file) => {
      const fileType = file.file_type.toLowerCase()
      if (fileType.startsWith('image/')) counts.image++
      else if (fileType.startsWith('audio/')) counts.audio++
      else if (fileType.startsWith('video/')) counts.video++
      else if (
        fileType.includes('pdf') ||
        fileType.includes('document') ||
        fileType.includes('text') ||
        fileType.includes('msword') ||
        fileType.includes('wordprocessingml')
      )
        counts.document++
    })

    return counts
  }

  const categoryCounts = getCategoryCounts()

  // Handle file upload
  const handleFileUpload = async (uploadFiles: FileList | null) => {
    if (!uploadFiles || uploadFiles.length === 0) return

    setUploading(true)
    try {
      // Upload files one by one
      for (let i = 0; i < uploadFiles.length; i++) {
        const file = uploadFiles[i]
        await filesService.upload(file)
      }

      // Refresh file list
      await fetchFiles()
    } catch (err) {
      console.error('Error uploading files:', err)
      setError(err as Error)
    } finally {
      setUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  // Drag and drop handlers
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    const droppedFiles = e.dataTransfer.files
    handleFileUpload(droppedFiles)
  }

  // File actions
  const handleDeleteFile = async () => {
    if (!selectedFile) return

    try {
      await filesService.delete(selectedFile.id)
      await fetchFiles()
      setDeleteDialogOpen(false)
      setSelectedFile(null)
    } catch (err) {
      console.error('Error deleting file:', err)
      setError(err as Error)
    }
  }

  const openRenameDialog = (file: FileMetadata) => {
    setSelectedFile(file)
    setNewFileName(file.filename)
    setRenameDialogOpen(true)
  }

  const openDeleteDialog = (file: FileMetadata) => {
    setSelectedFile(file)
    setDeleteDialogOpen(true)
  }

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
    return (bytes / (1024 * 1024 * 1024)).toFixed(1) + ' GB'
  }

  // Format date
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(date)
  }

  // Get file icon
  const getFileIcon = (fileType: string) => {
    const type = fileType.toLowerCase()
    if (type.startsWith('image/')) return ImageIcon
    if (type.startsWith('audio/')) return Music
    if (type.startsWith('video/')) return Video
    return FileText
  }

  // Render file card
  const renderFileCard = (file: FileMetadata) => {
    const FileIcon = getFileIcon(file.file_type)
    const isImage = file.file_type.toLowerCase().startsWith('image/')

    if (viewMode === 'grid') {
      return (
        <Card
          key={file.id}
          className="group cursor-pointer overflow-hidden transition-shadow hover:shadow-md"
          onDoubleClick={() => window.open(file.url, '_blank')}
          title="Double-click to view"
        >
          <CardContent className="p-0">
            <div className="relative flex aspect-square items-center justify-center overflow-hidden bg-muted">
              {isImage && file.url ? (
                <img
                  src={file.url}
                  alt={file.filename}
                  className="h-full w-full object-cover"
                />
              ) : (
                <FileIcon className="h-12 w-12 text-muted-foreground" />
              )}

              {/* Action menu overlay */}
              <div className="absolute right-2 top-2 opacity-0 transition-opacity group-hover:opacity-100">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="secondary" size="icon" className="h-8 w-8">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => openRenameDialog(file)}>
                      <Edit2 className="mr-2 h-4 w-4" />
                      Rename
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => openDeleteDialog(file)}
                      className="text-destructive"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            <div className="p-3">
              <p className="mb-1 truncate text-sm font-medium">{file.filename}</p>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>{formatFileSize(file.file_size)}</span>
                <span>{formatDate(file.uploaded_at)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )
    }

    // List view
    return (
      <Card
        key={file.id}
        className="mb-2 cursor-pointer transition-shadow hover:shadow-sm"
        onDoubleClick={() => window.open(file.url, '_blank')}
        title="Double-click to view"
      >
        <CardContent className="p-3">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0">
              {isImage && file.url ? (
                <img
                  src={file.url}
                  alt={file.filename}
                  className="h-10 w-10 rounded object-cover"
                />
              ) : (
                <div className="flex h-10 w-10 items-center justify-center rounded bg-muted">
                  <FileIcon className="h-5 w-5 text-muted-foreground" />
                </div>
              )}
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{file.filename}</p>
              <p className="text-xs text-muted-foreground">
                {formatFileSize(file.file_size)} • {formatDate(file.uploaded_at)}
              </p>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => openRenameDialog(file)}>
                  <Edit2 className="mr-2 h-4 w-4" />
                  Rename
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => openDeleteDialog(file)}
                  className="text-destructive"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (loading) {
    return (
      <AppLayout>
        <LoadingState />
      </AppLayout>
    )
  }

  if (error && files.length === 0) {
    return (
      <AppLayout>
        <ErrorState error={error} retry={fetchFiles} />
      </AppLayout>
    )
  }

  const storagePercentage = (storageUsed / storageTotal) * 100

  return (
    <AppLayout>
      <div className="flex h-full flex-col">
        {/* Header */}
        <div className="border-b bg-background">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate('/tools')}
                className="lg:hidden"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div className="flex items-center gap-2">
                <div className="rounded-lg bg-primary/10 p-2">
                  <Cloud className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h1 className="text-xl font-semibold">My Files</h1>
                  <p className="text-sm text-muted-foreground">
                    {formatFileSize(storageUsed)} / {STORAGE_QUOTA_GB}GB used
                  </p>
                </div>
              </div>
            </div>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/tools')}
              className="hidden lg:flex"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Storage progress bar */}
          <div className="px-4 pb-4">
            <Progress value={storagePercentage} className="h-2" />
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Left Sidebar - Categories */}
          <div className="hidden w-64 flex-col border-r bg-muted/30 md:flex">
            <div className="p-4">
              <Button className="w-full" onClick={() => fileInputRef.current?.click()}>
                <FolderPlus className="mr-2 h-4 w-4" />
                Upload Files
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                className="hidden"
                onChange={(e) => handleFileUpload(e.target.files)}
              />
            </div>

            <Separator />

            <ScrollArea className="flex-1">
              <div className="p-2">
                {FILE_CATEGORIES.map((category) => {
                  const Icon = category.icon
                  return (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className={cn(
                        'mb-1 flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors',
                        selectedCategory === category.id
                          ? 'bg-primary text-primary-foreground'
                          : 'hover:bg-muted'
                      )}
                    >
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4" />
                        <span>{category.label}</span>
                      </div>
                      <Badge variant={selectedCategory === category.id ? 'secondary' : 'outline'}>
                        {categoryCounts[category.id]}
                      </Badge>
                    </button>
                  )
                })}
              </div>
            </ScrollArea>
          </div>

          {/* Main Content */}
          <div className="flex flex-1 flex-col overflow-hidden">
            {/* Toolbar */}
            <div className="flex items-center gap-3 border-b p-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search files..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>

              <div className="flex items-center gap-1 rounded-lg border p-1">
                <Button
                  variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setViewMode('grid')}
                >
                  <LayoutGrid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setViewMode('list')}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>

              <Button className="md:hidden" onClick={() => fileInputRef.current?.click()}>
                <Upload className="mr-2 h-4 w-4" />
                Upload
              </Button>
            </div>

            {/* Files Area */}
            <ScrollArea className="flex-1">
              <div className="p-4">
                {filteredFiles.length === 0 && !uploading && (
                  <div
                    onDragEnter={handleDragEnter}
                    onDragLeave={handleDragLeave}
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                    className={cn(
                      'rounded-lg border-2 border-dashed p-12 text-center transition-colors',
                      isDragging ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'
                    )}
                  >
                    <Upload className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                    <h3 className="mb-2 text-lg font-semibold">
                      {searchQuery || selectedCategory !== 'all'
                        ? 'No files found'
                        : 'Drop files or click to upload'}
                    </h3>
                    <p className="mb-4 text-muted-foreground">
                      {searchQuery || selectedCategory !== 'all'
                        ? 'Try adjusting your search or filters'
                        : 'Images, audio, video, documents'}
                    </p>
                    {!searchQuery && selectedCategory === 'all' && (
                      <Button onClick={() => fileInputRef.current?.click()}>Browse Files</Button>
                    )}
                  </div>
                )}

                {uploading && (
                  <div className="py-8 text-center">
                    <LoadingState />
                    <p className="mt-4 text-muted-foreground">Uploading files...</p>
                  </div>
                )}

                {filteredFiles.length > 0 && (
                  <div
                    onDragEnter={handleDragEnter}
                    onDragLeave={handleDragLeave}
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                    className={cn(
                      viewMode === 'grid'
                        ? 'grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
                        : 'space-y-2'
                    )}
                  >
                    {filteredFiles.map(renderFileCard)}
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>
        </div>
      </div>

      {/* Rename Dialog */}
      <Dialog open={renameDialogOpen} onOpenChange={setRenameDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename File</DialogTitle>
            <DialogDescription>Enter a new name for this file.</DialogDescription>
          </DialogHeader>
          <Input
            value={newFileName}
            onChange={(e) => setNewFileName(e.target.value)}
            placeholder="File name"
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setRenameDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                // TODO: Implement rename functionality when API is ready
                setRenameDialogOpen(false)
              }}
            >
              Rename
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete File</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{selectedFile?.filename}"? This action cannot be
              undone.
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
    </AppLayout>
  )
}
