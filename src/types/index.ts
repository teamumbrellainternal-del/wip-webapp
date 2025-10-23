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
// Stub types file
export interface ConfigData {
  [key: string]: unknown
}

export type AppMode = 'development' | 'production' | 'form'

export interface AutoSaveOptions {
  enabled: boolean
  interval?: number
  debounceMs?: number
  maxHistorySize?: number
}

export interface StorageConfig {
  maxHistoryItems?: number
  compressionEnabled?: boolean
}
