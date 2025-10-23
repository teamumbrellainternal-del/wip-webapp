// Stub storage utilities
import type { ConfigData, AppMode, AutoSaveOptions, StorageConfig } from '@/types'

export function loadConfigData(): ConfigData {
  return {}
}

export function saveConfigData(_data: ConfigData): void {
  // Stub
}

export function loadRawContent(): string {
  return ''
}

export function saveRawContent(_content: string): void {
  // Stub
}

export function loadAppMode(): AppMode {
  return 'development'
}

export function saveAppMode(_mode: AppMode): void {
  // Stub
}

export function saveConfigDataWithAutoSave(_data: ConfigData): void {
  // Stub
}

export function saveRawContentWithAutoSave(_content: string): void {
  // Stub
}

export function loadAutoSaveOptions(): AutoSaveOptions {
  return { enabled: false }
}

export function saveAutoSaveOptions(_options: AutoSaveOptions): void {
  // Stub
}

export function getRecentConfigurations(): ConfigData[] {
  return []
}

export function restoreFromHistory(_timestamp: number): { configData?: ConfigData; rawContent?: string } {
  return {}
}

export function clearConfigHistory(): void {
  // Stub
}

export function isStorageAvailable(): boolean {
  return true
}

export function getStorageInfo(): { used: number; available: number; quota: number } {
  return { used: 0, available: 0, quota: 0 }
}

export function handleStorageQuotaExceeded(): void {
  // Stub
}
