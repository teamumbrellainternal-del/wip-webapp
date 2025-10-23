// Placeholder types file
export type StorageKey = string

export interface ConfigData {
  [key: string]: any
}

export type AppMode = 'form' | 'raw' | 'preview'

export interface AutoSaveOptions {
  enabled: boolean
  debounceMs: number
  maxHistorySize: number
}

export interface StorageConfig {
  timestamp: number
  configData?: ConfigData
  rawContent?: string
}
