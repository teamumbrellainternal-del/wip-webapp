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
