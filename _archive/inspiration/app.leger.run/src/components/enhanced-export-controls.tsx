import React, { useState } from 'react'
import { FileDown, Download, Package, FileJson } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { SaveButton } from '@/components/ui/form/feedback/save-button'
import { ExportReadinessIndicator } from '@/components/ui/form/feedback/export-readiness-indicator'
import { ExportValidator } from '@/validation/export-validator'
import type { ConfigData } from '@/types'

export type ExportFormat = 'env' | 'json' | 'docker' | 'yaml'

interface EnhancedExportControlsProps {
  formData: ConfigData
  onExport: (format: ExportFormat) => Promise<void>
  className?: string
}

export function EnhancedExportControls({ 
  formData, 
  onExport,
  className
}: EnhancedExportControlsProps) {
  const [isExporting, setIsExporting] = useState(false)
  const [exportingFormat, setExportingFormat] = useState<ExportFormat | null>(null)
  const [isDirty, setIsDirty] = useState(false)
  
  const exportValidator = new ExportValidator()
  const validationResult = exportValidator.validateForProduction(formData)
  
  const handleExport = async (format: ExportFormat) => {
    setIsExporting(true)
    setExportingFormat(format)
    try {
      await onExport(format)
      setIsDirty(false)
    } catch (error) {
      console.error(`Export failed for format ${format}:`, error)
    } finally {
      setIsExporting(false)
      setExportingFormat(null)
    }
  }
  
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Export Configuration</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <ExportReadinessIndicator 
          _isReady={validationResult.isReady}
          errors={validationResult.errors}
          warnings={validationResult.warnings}
          suggestions={validationResult.suggestions}
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SaveButton
            isLoading={isExporting && exportingFormat === 'env'}
            isDirty={isDirty}
            disabled={!validationResult.isReady}
            onClick={() => handleExport('env')}
            variant="default"
            className="w-full"
          >
            <FileDown className="h-4 w-4 mr-2" />
            Export .env
          </SaveButton>
          
          <SaveButton
            isLoading={isExporting && exportingFormat === 'json'}
            isDirty={isDirty}
            disabled={!validationResult.isReady}
            onClick={() => handleExport('json')}
            variant="outline"
            className="w-full"
          >
            <FileJson className="h-4 w-4 mr-2" />
            Export JSON
          </SaveButton>
          
          <SaveButton
            isLoading={isExporting && exportingFormat === 'docker'}
            isDirty={isDirty}
            disabled={!validationResult.isReady}
            onClick={() => handleExport('docker')}
            variant="outline"
            className="w-full"
          >
            <Package className="h-4 w-4 mr-2" />
            Export Docker
          </SaveButton>
          
          <SaveButton
            isLoading={isExporting && exportingFormat === 'yaml'}
            isDirty={isDirty}
            disabled={!validationResult.isReady}
            onClick={() => handleExport('yaml')}
            variant="outline"
            className="w-full"
          >
            <Download className="h-4 w-4 mr-2" />
            Export YAML
          </SaveButton>
        </div>
        
        {validationResult.warnings.length > 0 && (
          <p className="text-sm text-yellow-600 dark:text-yellow-400">
            ⚠️ {validationResult.warnings.length} warning{validationResult.warnings.length !== 1 ? 's' : ''} found - review before production use
          </p>
        )}
      </CardContent>
    </Card>
  )
}