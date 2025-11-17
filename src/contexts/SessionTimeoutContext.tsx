import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { SessionTimeoutModal } from '@/components/SessionTimeoutModal'

interface SessionTimeoutContextType {
  showSessionTimeout: () => void
}

const SessionTimeoutContext = createContext<SessionTimeoutContextType | undefined>(undefined)

export function SessionTimeoutProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)

  const showSessionTimeout = () => {
    setIsOpen(true)
  }

  // Register global handler on mount
  useEffect(() => {
    setGlobalSessionTimeoutHandler(showSessionTimeout)
    return () => {
      setGlobalSessionTimeoutHandler(() => {})
    }
  }, [])

  return (
    <SessionTimeoutContext.Provider value={{ showSessionTimeout }}>
      {children}
      <SessionTimeoutModal isOpen={isOpen} />
    </SessionTimeoutContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useSessionTimeout() {
  const context = useContext(SessionTimeoutContext)
  if (context === undefined) {
    throw new Error('useSessionTimeout must be used within a SessionTimeoutProvider')
  }
  return context
}

// Global function to show session timeout from outside React components
let globalShowSessionTimeout: (() => void) | null = null

// eslint-disable-next-line react-refresh/only-export-components
export function setGlobalSessionTimeoutHandler(handler: () => void) {
  globalShowSessionTimeout = handler
}

// eslint-disable-next-line react-refresh/only-export-components
export function triggerSessionTimeout() {
  if (globalShowSessionTimeout) {
    globalShowSessionTimeout()
  }
}
