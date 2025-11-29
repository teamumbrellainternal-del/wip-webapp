import { useState, useEffect } from 'react'
import { ModeToggle } from '@/components/mode-toggle'
import { ConfigFormRJSF } from '@/components/config-form-rjsf'
import { RawEditor } from '@/components/raw-editor'
import { ImportControls } from '@/components/import-controls'
import { ExportControls } from '@/components/export-controls'
import { loadConfigData, loadRawContent, loadAppMode, saveAppMode, saveConfigData, saveRawContent } from '@/utils/storage'
import { generateEnvContent } from '@/utils/env-generator'
import { parseEnvContent } from '@/utils/env-parser'
import type { AppMode, ConfigData } from '@/types'

export default function App() {
  const [mode, setMode] = useState<AppMode>('form')
  const [configData, setConfigData] = useState<ConfigData>({})
  const [rawContent, setRawContent] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  
  // Initialize app state from localStorage
  useEffect(() => {
    const savedMode = loadAppMode()
    const savedConfigData = loadConfigData()
    const savedRawContent = loadRawContent()
    
    setMode(savedMode)
    setConfigData(savedConfigData)
    setRawContent(savedRawContent)
    setIsLoading(false)
  }, [])
  
  // Sync data between modes
  const handleModeChange = (newMode: AppMode) => {
    if (newMode === mode) return
    
    if (mode === 'form' && newMode === 'raw') {
      // Convert form data to raw content
      const envContent = generateEnvContent(configData, true)
      setRawContent(envContent)
      saveRawContent(envContent)
    } else if (mode === 'raw' && newMode === 'form') {
      // Convert raw content to form data
      const { data, errors } = parseEnvContent(rawContent)
      if (errors.length === 0) {
        setConfigData(data)
        saveConfigData(data)
      }
    }
    
    setMode(newMode)
    saveAppMode(newMode)
  }
  
  const handleConfigDataChange = (newData: ConfigData) => {
    setConfigData(newData)
    saveConfigData(newData)
  }
  
  const handleRawContentChange = (newContent: string) => {
    setRawContent(newContent)
    saveRawContent(newContent)
  }
  
  const handleImport = (importedData: ConfigData) => {
    setConfigData(importedData)
    saveConfigData(importedData)
    
    // Also update raw content if in raw mode
    if (mode === 'raw') {
      const envContent = generateEnvContent(importedData, true)
      setRawContent(envContent)
      saveRawContent(envContent)
    }
  }
  
  const handleImportRaw = (importedContent: string) => {
    setRawContent(importedContent)
    saveRawContent(importedContent)
    
    // Also update form data if in form mode
    if (mode === 'form') {
      const { data, errors } = parseEnvContent(importedContent)
      if (errors.length === 0) {
        setConfigData(data)
        saveConfigData(data)
      }
    }
  }
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    )
  }
  
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold">OpenWebUI Config Tool</h1>
            <p className="text-muted-foreground mt-2">
              Generate valid configuration files for OpenWebUI deployments
            </p>
          </div>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Mode Toggle */}
        <ModeToggle 
          mode={mode} 
          onModeChange={handleModeChange}
        />
        
        {/* Import/Export Controls */}
        <div className="grid md:grid-cols-2 gap-4 mb-6">
          <ImportControls 
            onImport={handleImport}
            onImportRaw={handleImportRaw}
          />
          <ExportControls 
            configData={configData}
            rawContent={rawContent}
            mode={mode}
          />
        </div>
        
        {/* Main Editor */}
        {mode === 'form' ? (
          <ConfigFormRJSF 
            data={configData}
            onDataChange={handleConfigDataChange}
          />
        ) : (
          <RawEditor 
            content={rawContent}
            onContentChange={handleRawContentChange}
          />
        )}
      </main>
      
      {/* Footer */}
      <footer className="border-t mt-12">
        <div className="container mx-auto px-4 py-6 text-center text-sm text-muted-foreground">
          <div>
            Built for the OpenWebUI community •{' '}
            <a 
              href="https://github.com/open-webui/open-webui" 
              target="_blank" 
              rel="noopener noreferrer"
              className="hover:text-foreground transition-colors"
            >
              OpenWebUI Project
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
}
