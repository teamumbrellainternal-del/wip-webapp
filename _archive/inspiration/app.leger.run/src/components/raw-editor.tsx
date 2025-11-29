import { useState, useEffect } from 'react'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { validateEnvSyntax, formatEnvContent } from '@/utils/env-parser'
import { saveRawContent } from '@/utils/storage'
import type { ValidationError } from '@/types'

interface RawEditorProps {
  content: string
  onContentChange: (content: string) => void
  className?: string
}

export function RawEditor({ content, onContentChange, className }: RawEditorProps) {
  const [localContent, setLocalContent] = useState(content)
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([])
  
  // Sync with external content changes
  useEffect(() => {
    setLocalContent(content)
  }, [content])
  
  // Validate content on change
  useEffect(() => {
    const errors = validateEnvSyntax(localContent)
    setValidationErrors(errors)
  }, [localContent])
  
  const handleContentChange = (value: string) => {
    setLocalContent(value)
    onContentChange(value)
    
    // Save to localStorage
    saveRawContent(value)
  }
  
  const handleFormat = () => {
    const formatted = formatEnvContent(localContent)
    handleContentChange(formatted)
  }
  
  const hasErrors = validationErrors.length > 0
  
  return (
    <div className={className}>
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Raw Configuration Editor</CardTitle>
            <button
              onClick={handleFormat}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Format
            </button>
          </div>
          {hasErrors && (
            <div className="text-sm text-destructive">
              {validationErrors.length} syntax error{validationErrors.length !== 1 ? 's' : ''} found
            </div>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            value={localContent}
            onChange={(e) => handleContentChange(e.target.value)}
            placeholder="Enter your .env configuration here...

Example:
# Database configuration
DATABASE_URL=postgresql://user:password@localhost:5432/mydb

# API settings
API_KEY=your-api-key-here
DEBUG=true"
            className={`min-h-[400px] font-mono text-sm ${hasErrors ? 'border-destructive' : ''}`}
          />
          
          {hasErrors && (
            <div className="space-y-2">
              <div className="text-sm font-medium text-destructive">Validation Errors:</div>
              <div className="space-y-1">
                {validationErrors.map((error, index) => (
                  <div key={index} className="text-sm text-destructive bg-destructive/10 p-2 rounded">
                    <span className="font-medium">{error.field}:</span> {error.message}
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <div className="text-xs text-muted-foreground">
            Tip: Use the format button to clean up your configuration. Changes are automatically saved.
          </div>
        </CardContent>
      </Card>
    </div>
  )
}