import React, { createContext, useEffect } from 'react'

interface ThemeProviderProps {
  children: React.ReactNode
  defaultTheme?: 'light' | 'dark' | 'system'
  storageKey?: string
}

const ThemeProviderContext = createContext<{
  theme: string
  setTheme: (theme: string) => void
} | undefined>(undefined)

export function ThemeProvider({ 
  children, 
  defaultTheme = 'system',
  ..._ 
}: ThemeProviderProps) {
  useEffect(() => {
    // Initialize theme on mount
    const root = window.document.documentElement
    const initialTheme = localStorage.getItem('ui-theme') || defaultTheme
    
    if (initialTheme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
      root.classList.remove('light', 'dark')
      root.classList.add(systemTheme)
    } else {
      root.classList.remove('light', 'dark')
      root.classList.add(initialTheme)
    }
  }, [defaultTheme])

  return (
    <ThemeProviderContext.Provider value={{ theme: defaultTheme, setTheme: () => {} }}>
      {children}
    </ThemeProviderContext.Provider>
  )
}
