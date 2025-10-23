import React from 'react'

interface ConditionalFieldProps {
  condition?: boolean
  show?: boolean
  children: React.ReactNode
}

export function ConditionalField({ condition, show, children }: ConditionalFieldProps) {
  const shouldShow = show !== undefined ? show : condition
  if (!shouldShow) return null
  return <>{children}</>
}
