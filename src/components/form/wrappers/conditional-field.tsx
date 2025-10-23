import { ReactNode } from 'react'

interface ConditionalFieldProps {
  children: ReactNode
  condition?: boolean
  show?: boolean
}

export function ConditionalField({ children, condition = true, show = true }: ConditionalFieldProps) {
  if (!condition || !show) return null
  return <>{children}</>
}
