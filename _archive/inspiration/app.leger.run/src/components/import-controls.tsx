import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Upload, Clipboard } from 'lucide-react'
import { parseEnvContent } from '@/utils/env-parser'
import type { ConfigData, ImportResult } from '@/types'

interface ImportControlsProps {
  onImport: (data: ConfigData) => void
  onImportRaw: (content: string) => void
  disabled?: boolean
}

export function ImportControls({ onImport, onImportRaw, disabled }: ImportControlsProps) {
  const [isImporting, setIsImporting] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const handleFileSelect = async (file: File): Promise<ImportResult> => {
    try {
      const content = await readFileContent(file)
      const { data, errors } = parseEnvContent(content)
      
      if (errors.length > 0) {
        return {
          success: false,
          errors
        }
      }
      
      return {
        success: true,
        data
      }
    } catch (error) {
      return {
        success: false,
        errors: [{ field: 'file', message: `Failed to read file: ${error}` }]
      }
    }
  }
  
  const readFileContent = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => resolve(e.target?.result as string)
      reader.onerror = (e) => reject(e.target?.error)
      reader.readAsText(file)
    })
  }
  
  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return
    
    const file = files[0]
    setIsImporting(true)
    
    try {
      const content = await readFileContent(file)
      onImportRaw(content)
      
      const result = await handleFileSelect(file)
      if (result.success && result.data) {
        onImport(result.data)
      }
    } catch (error) {
      console.error('Import failed:', error)
    } finally {
      setIsImporting(false)
    }
  }
  
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    
    if (disabled || isImporting) return
    
    handleFileUpload(e.dataTransfer.files)
  }
  
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    if (!disabled && !isImporting) {
      setDragOver(true)
    }
  }
  
  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
  }
  
  const handlePasteFromClipboard = async () => {
    if (disabled || isImporting) return
    
    try {
      setIsImporting(true)
      const text = await navigator.clipboard.readText()
      
      if (text.trim()) {
        onImportRaw(text)
        
        const { data, errors } = parseEnvContent(text)
        if (errors.length === 0) {
          onImport(data)
        }
      }
    } catch (error) {
      console.error('Failed to read from clipboard:', error)
    } finally {
      setIsImporting(false)
    }
  }
  
  const openFileDialog = () => {
    if (!disabled && !isImporting) {
      fileInputRef.current?.click()
    }
  }
  
  return (
    <Card className="mb-6">
      <CardContent className="pt-6">
        <div className="space-y-4">
          <div className="text-sm font-medium text-center">Import Configuration</div>
          
          {/* Drag and Drop Zone */}
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragOver
                ? 'border-primary bg-primary/5'
                : 'border-muted-foreground/25 hover:border-muted-foreground/50'
            } ${disabled || isImporting ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            onClick={openFileDialog}
          >
            <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
            <div className="text-sm">
              <div>Drop your .env file here or click to browse</div>
              <div className="text-muted-foreground text-xs mt-1">
                Supports .env, .txt, and other text files
              </div>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex gap-2 justify-center">
            <Button
              variant="outline"
              size="sm"
              onClick={openFileDialog}
              disabled={disabled || isImporting}
            >
              <Upload className="w-4 h-4 mr-2" />
              Choose File
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={handlePasteFromClipboard}
              disabled={disabled || isImporting}
            >
              <Clipboard className="w-4 h-4 mr-2" />
              Paste from Clipboard
            </Button>
          </div>
          
          {isImporting && (
            <div className="text-center text-sm text-muted-foreground">
              Importing configuration...
            </div>
          )}
        </div>
        
        <input
          ref={fileInputRef}
          type="file"
          accept=".env,.txt,text/*"
          onChange={(e) => handleFileUpload(e.target.files)}
          className="hidden"
        />
      </CardContent>
    </Card>
  )
}