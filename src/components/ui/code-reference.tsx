import type React from 'react'
interface CodeReferenceProps {
  children: React.ReactNode
  className?: string
}

export function CodeReference({ children, className }: CodeReferenceProps) {
  return (
    <code className={`rounded bg-muted px-1.5 py-0.5 font-mono text-sm ${className}`}>
      {children}
    </code>
  )
}
