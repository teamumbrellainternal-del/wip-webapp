import { useState, useEffect, useCallback } from 'react'
import type { ConfigData, AppMode, AutoSaveOptions, StorageConfig } from '@/types'
import {
  loadConfigData,
  saveConfigData,
  loadRawContent,
  saveRawContent,
  loadAppMode,
  saveAppMode,
  saveConfigDataWithAutoSave,
  saveRawContentWithAutoSave,
  loadAutoSaveOptions,
  saveAutoSaveOptions,
  getRecentConfigurations,
  restoreFromHistory,
  clearConfigHistory,
  isStorageAvailable,
  getStorageInfo,
  handleStorageQuotaExceeded
} from '@/utils/storage'

interface UseLocalStorageReturn {
  // Data
  configData: ConfigData
  rawContent: string
  appMode: AppMode
  autoSaveOptions: AutoSaveOptions
  recentConfigs: StorageConfig[]
  
  // Actions
  updateConfigData: (data: ConfigData, autoSave?: boolean) => void
  updateRawContent: (content: string, autoSave?: boolean) => void
  updateAppMode: (mode: AppMode) => void
  updateAutoSaveOptions: (options: AutoSaveOptions) => void
  
  // History management
  refreshRecentConfigs: () => void
  restoreConfiguration: (timestamp: number) => void
  clearHistory: () => void
  
  // Storage management
  isAvailable: boolean
  storageInfo: { used: number; available: number; quota: number }
  refreshStorageInfo: () => void
}

export function useLocalStorage(): UseLocalStorageReturn {
  // State
  const [configData, setConfigData] = useState<ConfigData>({})
  const [rawContent, setRawContent] = useState<string>('')
  const [appMode, setAppMode] = useState<AppMode>('form')
  const [autoSaveOptions, setAutoSaveOptions] = useState<AutoSaveOptions>({
    enabled: true,
    debounceMs: 1000,
    maxHistorySize: 10
  })
  const [recentConfigs, setRecentConfigs] = useState<StorageConfig[]>([])
  const [isAvailable, setIsAvailable] = useState<boolean>(true)
  const [storageInfo, setStorageInfo] = useState({ used: 0, available: 0, quota: 0 })

  // Initialize from localStorage on mount
  useEffect(() => {
    try {
      const available = isStorageAvailable()
      setIsAvailable(available)

      if (available) {
        setConfigData(loadConfigData())
        setRawContent(loadRawContent())
        setAppMode(loadAppMode())
        setAutoSaveOptions(loadAutoSaveOptions())
        setRecentConfigs(getRecentConfigurations())
        setStorageInfo(getStorageInfo())
      }
    } catch (error) {
      console.warn('Failed to initialize from localStorage:', error)
      setIsAvailable(false)
    }
  }, [])

  // Update config data
  const updateConfigData = useCallback((data: ConfigData, autoSave: boolean = true) => {
    try {
      setConfigData(data)
      
      if (autoSave && autoSaveOptions.enabled) {
        saveConfigDataWithAutoSave(data)
      } else {
        saveConfigData(data)
      }
      
      // Refresh recent configs after save
      setTimeout(() => {
        setRecentConfigs(getRecentConfigurations())
        setStorageInfo(getStorageInfo())
      }, 100)
    } catch (error) {
      console.warn('Failed to update config data:', error)
      
      // Handle quota exceeded
      if (error instanceof Error && error.name === 'QuotaExceededError') {
        handleStorageQuotaExceeded()
        // Retry the save
        try {
          if (autoSave && autoSaveOptions.enabled) {
            saveConfigDataWithAutoSave(data)
          } else {
            saveConfigData(data)
          }
        } catch (retryError) {
          console.error('Failed to save even after cleanup:', retryError)
        }
      }
    }
  }, [autoSaveOptions.enabled])

  // Update raw content
  const updateRawContent = useCallback((content: string, autoSave: boolean = true) => {
    try {
      setRawContent(content)
      
      if (autoSave && autoSaveOptions.enabled) {
        saveRawContentWithAutoSave(content)
      } else {
        saveRawContent(content)
      }
      
      // Refresh recent configs after save
      setTimeout(() => {
        setRecentConfigs(getRecentConfigurations())
        setStorageInfo(getStorageInfo())
      }, 100)
    } catch (error) {
      console.warn('Failed to update raw content:', error)
      
      // Handle quota exceeded
      if (error instanceof Error && error.name === 'QuotaExceededError') {
        handleStorageQuotaExceeded()
        // Retry the save
        try {
          if (autoSave && autoSaveOptions.enabled) {
            saveRawContentWithAutoSave(content)
          } else {
            saveRawContent(content)
          }
        } catch (retryError) {
          console.error('Failed to save even after cleanup:', retryError)
        }
      }
    }
  }, [autoSaveOptions.enabled])

  // Update app mode
  const updateAppMode = useCallback((mode: AppMode) => {
    try {
      setAppMode(mode)
      saveAppMode(mode)
    } catch (error) {
      console.warn('Failed to update app mode:', error)
    }
  }, [])

  // Update auto-save options
  const updateAutoSaveOptions = useCallback((options: AutoSaveOptions) => {
    try {
      setAutoSaveOptions(options)
      saveAutoSaveOptions(options)
    } catch (error) {
      console.warn('Failed to update auto-save options:', error)
    }
  }, [])

  // Refresh recent configs
  const refreshRecentConfigs = useCallback(() => {
    try {
      setRecentConfigs(getRecentConfigurations())
      setStorageInfo(getStorageInfo())
    } catch (error) {
      console.warn('Failed to refresh recent configs:', error)
    }
  }, [])

  // Restore configuration from history
  const restoreConfiguration = useCallback((timestamp: number) => {
    try {
      const restored = restoreFromHistory(timestamp)
      
      if (restored.configData) {
        setConfigData(restored.configData)
      }
      
      if (restored.rawContent) {
        setRawContent(restored.rawContent)
      }
      
      refreshRecentConfigs()
    } catch (error) {
      console.warn('Failed to restore configuration:', error)
    }
  }, [refreshRecentConfigs])

  // Clear history
  const clearHistory = useCallback(() => {
    try {
      clearConfigHistory()
      setRecentConfigs([])
      setStorageInfo(getStorageInfo())
    } catch (error) {
      console.warn('Failed to clear history:', error)
    }
  }, [])

  // Refresh storage info
  const refreshStorageInfo = useCallback(() => {
    try {
      setStorageInfo(getStorageInfo())
    } catch (error) {
      console.warn('Failed to refresh storage info:', error)
    }
  }, [])

  return {
    // Data
    configData,
    rawContent,
    appMode,
    autoSaveOptions,
    recentConfigs,
    
    // Actions
    updateConfigData,
    updateRawContent,
    updateAppMode,
    updateAutoSaveOptions,
    
    // History management
    refreshRecentConfigs,
    restoreConfiguration,
    clearHistory,
    
    // Storage management
    isAvailable,
    storageInfo,
    refreshStorageInfo
  }
}

// Hook for storage status monitoring
export function useStorageStatus() {
  const [isAvailable, setIsAvailable] = useState<boolean>(true)
  const [storageInfo, setStorageInfo] = useState({ used: 0, available: 0, quota: 0 })
  const [isNearQuota, setIsNearQuota] = useState<boolean>(false)

  const refreshStatus = useCallback(() => {
    try {
      const available = isStorageAvailable()
      const info = getStorageInfo()
      const nearQuota = info.quota > 0 && (info.used / info.quota) > 0.8

      setIsAvailable(available)
      setStorageInfo(info)
      setIsNearQuota(nearQuota)
    } catch (error) {
      console.warn('Failed to refresh storage status:', error)
      setIsAvailable(false)
    }
  }, [])

  useEffect(() => {
    refreshStatus()
  }, [refreshStatus])

  return {
    isAvailable,
    storageInfo,
    isNearQuota,
    refreshStatus
  }
}