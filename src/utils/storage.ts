import type { ConfigData, AppMode, AutoSaveOptions, StorageConfig } from '@/types'

// Storage utility functions
export function getStorageItem<T>(key: string): T | null {
  try {
    const item = localStorage.getItem(key)
    return item ? JSON.parse(item) : null
  } catch {
    return null
  }
}

export function setStorageItem<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch (error) {
    console.error('Failed to save to storage:', error)
  }
}

// Config data functions
export function loadConfigData(): ConfigData {
  return getStorageItem<ConfigData>('configData') || {}
}

export function saveConfigData(data: ConfigData): void {
  setStorageItem('configData', data)
}

// Raw content functions
export function loadRawContent(): string {
  return getStorageItem<string>('rawContent') || ''
}

export function saveRawContent(content: string): void {
  setStorageItem('rawContent', content)
}

// App mode functions
export function loadAppMode(): AppMode {
  return getStorageItem<AppMode>('appMode') || 'form'
}

export function saveAppMode(mode: AppMode): void {
  setStorageItem('appMode', mode)
}

// Auto-save functions
export function saveConfigDataWithAutoSave(data: ConfigData): void {
  saveConfigData(data)
  // Add to history
  const history = getRecentConfigurations()
  history.unshift({ timestamp: Date.now(), configData: data })
  setStorageItem('configHistory', history.slice(0, 10))
}

export function saveRawContentWithAutoSave(content: string): void {
  saveRawContent(content)
  // Add to history
  const history = getRecentConfigurations()
  history.unshift({ timestamp: Date.now(), rawContent: content })
  setStorageItem('configHistory', history.slice(0, 10))
}

export function loadAutoSaveOptions(): AutoSaveOptions {
  return getStorageItem<AutoSaveOptions>('autoSaveOptions') || {
    enabled: true,
    debounceMs: 1000,
    maxHistorySize: 10
  }
}

export function saveAutoSaveOptions(options: AutoSaveOptions): void {
  setStorageItem('autoSaveOptions', options)
}

// History functions
export function getRecentConfigurations(): StorageConfig[] {
  return getStorageItem<StorageConfig[]>('configHistory') || []
}

export function restoreFromHistory(timestamp: number): Partial<{ configData: ConfigData; rawContent: string }> {
  const history = getRecentConfigurations()
  const config = history.find(c => c.timestamp === timestamp)
  return config || {}
}

export function clearConfigHistory(): void {
  setStorageItem('configHistory', [])
}

// Storage management functions
export function isStorageAvailable(): boolean {
  try {
    const test = '__storage_test__'
    localStorage.setItem(test, test)
    localStorage.removeItem(test)
    return true
  } catch {
    return false
  }
}

export function getStorageInfo(): { used: number; available: number; quota: number } {
  try {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      // This is async but we'll return a default for now
      return { used: 0, available: 0, quota: 0 }
    }
    return { used: 0, available: 0, quota: 0 }
  } catch {
    return { used: 0, available: 0, quota: 0 }
  }
}

export function handleStorageQuotaExceeded(): void {
  try {
    // Clear old history entries
    const history = getRecentConfigurations()
    if (history.length > 5) {
      setStorageItem('configHistory', history.slice(0, 5))
    }
  } catch (error) {
    console.error('Failed to handle storage quota exceeded:', error)
  }
}
