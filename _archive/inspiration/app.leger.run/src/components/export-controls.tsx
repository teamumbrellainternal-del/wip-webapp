import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Download, Copy, Check } from 'lucide-react'
import { generateEnvContent } from '@/utils/env-generator'
import type { ConfigData } from '@/types'

interface ExportControlsProps {
  configData: ConfigData
  rawContent: string
  mode: 'form' | 'raw'
  disabled?: boolean
}

export function ExportControls({ configData, rawContent, mode, disabled }: ExportControlsProps) {
  const [filename, setFilename] = useState('openwebui.env')
  const [copied, setCopied] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  
  const getContentToExport = (): string => {
    if (mode === 'raw') {
      return rawContent
    } else {
      return generateEnvContent(configData, true)
    }
  }
  
  const handleDownload = () => {
    if (disabled || isExporting) return
    
    setIsExporting(true)
    
    try {
      const content = getContentToExport()
      const blob = new Blob([content], { type: 'text/plain' })
      const url = URL.createObjectURL(blob)
      
      const link = document.createElement('a')
      link.href = url
      link.download = filename || 'openwebui.env'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Download failed:', error)
    } finally {
      setIsExporting(false)
    }
  }
  
  const handleCopyToClipboard = async () => {
    if (disabled || isExporting) return
    
    try {
      const content = getContentToExport()
      await navigator.clipboard.writeText(content)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Copy to clipboard failed:', error)
    }
  }
  
  const hasContent = mode === 'raw' ? rawContent.trim().length > 0 : Object.keys(configData).length > 0
  
  return (
    <Card className="mb-6">
      <CardContent className="pt-6">
        <div className="space-y-4">
          <div className="text-sm font-medium text-center">Export Configuration</div>
          
          {!hasContent && (
            <div className="text-center text-sm text-muted-foreground py-4">
              No configuration to export. Add some settings first.
            </div>
          )}
          
          {hasContent && (
            <>
              {/* Filename Input */}
              <div className="space-y-2">
                <label className="text-xs text-muted-foreground">Filename</label>
                <Input
                  value={filename}
                  onChange={(e) => setFilename(e.target.value)}
                  placeholder="openwebui.env"
                  className="text-sm"
                  disabled={disabled || isExporting}
                />
              </div>
              
              {/* Export Buttons */}
              <div className="flex gap-2 justify-center">
                <Button
                  variant="default"
                  size="sm"
                  onClick={handleDownload}
                  disabled={disabled || isExporting || !hasContent}
                >
                  <Download className="w-4 h-4 mr-2" />
                  {isExporting ? 'Downloading...' : 'Download'}
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopyToClipboard}
                  disabled={disabled || isExporting || !hasContent}
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 mr-2" />
                      Copy to Clipboard
                    </>
                  )}
                </Button>
              </div>
              
              {/* Preview */}
              <div className="space-y-2">
                <div className="text-xs text-muted-foreground">Preview (first 3 lines):</div>
                <div className="bg-muted p-3 rounded text-xs font-mono">
                  {getContentToExport()
                    .split('\n')
                    .slice(0, 3)
                    .join('\n') || 'Empty configuration'}
                  {getContentToExport().split('\n').length > 3 && '\n...'}
                </div>
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  )
}