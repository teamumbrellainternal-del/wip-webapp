import React from 'react'

interface ConditionalFieldProps {
  condition?: boolean
  show?: boolean
  children: React.ReactNode
}

export function ConditionalField({ condition, show, children }: ConditionalFieldProps) {
  const shouldShow = show !== undefined ? show : condition
  if (!shouldShow) return null
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
