import type React from 'react'
import { cn } from '@/lib/utils'

interface ConditionalFieldProps {
  show: boolean
  children: React.ReactNode
  className?: string
  animation?: boolean
}

export function ConditionalField({
  show,
  children,
  className,
  animation = true,
}: ConditionalFieldProps) {
  if (!show && !animation) {
    return null
  }

  return (
    <div
      className={cn(
        'overflow-hidden transition-all duration-200',
        show ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0',
        className
      )}
      aria-hidden={!show}
    >
      {children}
    </div>
  )
}
