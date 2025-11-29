import type { ConfigData, AppMode, StorageConfig, StorageHistory, AutoSaveOptions } from '@/types'

const STORAGE_KEYS = {
  CONFIG_DATA: 'openwebui-config-data',
  RAW_CONTENT: 'openwebui-raw-content',
  APP_MODE: 'openwebui-app-mode',
  CONFIG_HISTORY: 'openwebui-config-history',
  AUTO_SAVE_OPTIONS: 'openwebui-auto-save-options'
}

// Default auto-save configuration
const DEFAULT_AUTO_SAVE_OPTIONS: AutoSaveOptions = {
  enabled: true,
  debounceMs: 1000,
  maxHistorySize: 10
}

// Debounce utility for auto-save
let saveTimeout: number | null = null

export function saveConfigData(data: ConfigData): void {
  try {
    localStorage.setItem(STORAGE_KEYS.CONFIG_DATA, JSON.stringify(data))
  } catch (error) {
    console.warn('Failed to save config data to localStorage:', error)
  }
}

export function loadConfigData(): ConfigData {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.CONFIG_DATA)
    return stored ? JSON.parse(stored) : {}
  } catch (error) {
    console.warn('Failed to load config data from localStorage:', error)
    return {}
  }
}

export function saveRawContent(content: string): void {
  try {
    localStorage.setItem(STORAGE_KEYS.RAW_CONTENT, content)
  } catch (error) {
    console.warn('Failed to save raw content to localStorage:', error)
  }
}

export function loadRawContent(): string {
  try {
    return localStorage.getItem(STORAGE_KEYS.RAW_CONTENT) || ''
  } catch (error) {
    console.warn('Failed to load raw content from localStorage:', error)
    return ''
  }
}

export function saveAppMode(mode: AppMode): void {
  try {
    localStorage.setItem(STORAGE_KEYS.APP_MODE, mode)
  } catch (error) {
    console.warn('Failed to save app mode to localStorage:', error)
  }
}

export function loadAppMode(): AppMode {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.APP_MODE)
    return (stored === 'form' || stored === 'raw') ? stored : 'form'
  } catch (error) {
    console.warn('Failed to load app mode from localStorage:', error)
    return 'form'
  }
}

export function clearAllData(): void {
  try {
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key)
    })
  } catch (error) {
    console.warn('Failed to clear localStorage:', error)
  }
}

// Auto-save functionality
export function saveConfigDataWithAutoSave(data: ConfigData): void {
  const options = loadAutoSaveOptions()
  
  if (!options.enabled) {
    saveConfigData(data)
    return
  }

  // Clear existing timeout
  if (saveTimeout) {
    clearTimeout(saveTimeout)
  }

  // Debounce the save operation
  saveTimeout = setTimeout(() => {
    saveConfigData(data)
    addToHistory('CONFIG_DATA', data)
    saveTimeout = null
  }, options.debounceMs)
}

export function saveRawContentWithAutoSave(content: string): void {
  const options = loadAutoSaveOptions()
  
  if (!options.enabled) {
    saveRawContent(content)
    return
  }

  // Clear existing timeout
  if (saveTimeout) {
    clearTimeout(saveTimeout)
  }

  // Debounce the save operation
  saveTimeout = setTimeout(() => {
    saveRawContent(content)
    addToHistory('RAW_CONTENT', content)
    saveTimeout = null
  }, options.debounceMs)
}

// Configuration history management
export function addToHistory(key: string, value: ConfigData | string): void {
  try {
    const history = loadConfigHistory()
    const timestamp = Date.now()
    
    const newConfig: StorageConfig = {
      key,
      value,
      timestamp,
      version: '1.0'
    }

    // Add to beginning of array
    history.configs.unshift(newConfig)

    // Limit history size
    const options = loadAutoSaveOptions()
    const maxSize: number = options.maxHistorySize ?? DEFAULT_AUTO_SAVE_OPTIONS.maxHistorySize ?? 10
    if (history.configs.length > maxSize) {
      history.configs = history.configs.slice(0, maxSize)
    }

    history.maxSize = maxSize
    saveConfigHistory(history)
  } catch (error) {
    console.warn('Failed to add to history:', error)
  }
}

export function loadConfigHistory(): StorageHistory {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.CONFIG_HISTORY)
    if (stored) {
      const history = JSON.parse(stored) as StorageHistory
      return history
    }
    return { configs: [], maxSize: DEFAULT_AUTO_SAVE_OPTIONS.maxHistorySize ?? 10 }
  } catch (error) {
    console.warn('Failed to load config history:', error)
    return { configs: [], maxSize: DEFAULT_AUTO_SAVE_OPTIONS.maxHistorySize ?? 10 }
  }
}

export function saveConfigHistory(history: StorageHistory): void {
  try {
    localStorage.setItem(STORAGE_KEYS.CONFIG_HISTORY, JSON.stringify(history))
  } catch (error) {
    console.warn('Failed to save config history:', error)
  }
}

export function getRecentConfigurations(limit: number = 5): StorageConfig[] {
  const history = loadConfigHistory()
  return history.configs.slice(0, limit)
}

export function restoreFromHistory(timestamp: number): { configData?: ConfigData; rawContent?: string } {
  try {
    const history = loadConfigHistory()
    const configToRestore = history.configs.find(config => config.timestamp === timestamp)
    
    if (!configToRestore) {
      console.warn('Configuration not found in history')
      return {}
    }

    const result: { configData?: ConfigData; rawContent?: string } = {}

    if (configToRestore.key === 'CONFIG_DATA') {
      result.configData = configToRestore.value as ConfigData
      saveConfigData(result.configData)
    } else if (configToRestore.key === 'RAW_CONTENT') {
      result.rawContent = configToRestore.value as string
      saveRawContent(result.rawContent)
    }

    return result
  } catch (error) {
    console.warn('Failed to restore from history:', error)
    return {}
  }
}

export function clearConfigHistory(): void {
  try {
    localStorage.removeItem(STORAGE_KEYS.CONFIG_HISTORY)
  } catch (error) {
    console.warn('Failed to clear config history:', error)
  }
}

// Auto-save options management
export function loadAutoSaveOptions(): AutoSaveOptions {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.AUTO_SAVE_OPTIONS)
    if (stored) {
      const options = JSON.parse(stored) as AutoSaveOptions
      return { ...DEFAULT_AUTO_SAVE_OPTIONS, ...options }
    }
    return DEFAULT_AUTO_SAVE_OPTIONS
  } catch (error) {
    console.warn('Failed to load auto-save options:', error)
    return DEFAULT_AUTO_SAVE_OPTIONS
  }
}

export function saveAutoSaveOptions(options: AutoSaveOptions): void {
  try {
    localStorage.setItem(STORAGE_KEYS.AUTO_SAVE_OPTIONS, JSON.stringify(options))
  } catch (error) {
    console.warn('Failed to save auto-save options:', error)
  }
}

// Storage quota and error handling
export function getStorageInfo(): { used: number; available: number; quota: number } {
  try {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      // Modern API not widely supported in sync mode, fallback to estimate
      return { used: 0, available: 0, quota: 0 }
    }
    
    // Fallback: rough estimate based on localStorage usage
    let used = 0
    for (const key in localStorage) {
      if (Object.prototype.hasOwnProperty.call(localStorage, key)) {
        used += localStorage[key].length + key.length
      }
    }
    
    // Most browsers have ~5-10MB quota for localStorage
    const estimatedQuota = 10 * 1024 * 1024 // 10MB
    return {
      used,
      available: estimatedQuota - used,
      quota: estimatedQuota
    }
  } catch (error) {
    console.warn('Failed to get storage info:', error)
    return { used: 0, available: 0, quota: 0 }
  }
}

export function isStorageAvailable(): boolean {
  try {
    const test = '__storage_test__'
    localStorage.setItem(test, test)
    localStorage.removeItem(test)
    return true
  } catch (error) {
    return false
  }
}

export function handleStorageQuotaExceeded(): void {
  try {
    console.warn('Storage quota exceeded, cleaning up old history...')
    const history = loadConfigHistory()
    
    // Remove oldest half of history
    if (history.configs.length > 2) {
      history.configs = history.configs.slice(0, Math.floor(history.configs.length / 2))
      saveConfigHistory(history)
      console.info('Cleaned up old configuration history')
    }
  } catch (error) {
    console.warn('Failed to handle storage quota exceeded:', error)
  }
}