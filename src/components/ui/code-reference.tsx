import type React from "react"
interface CodeReferenceProps {
  children: React.ReactNode
  className?: string
}

export function CodeReference({ children, className }: CodeReferenceProps) {
  return <code className={`bg-muted px-1.5 py-0.5 rounded text-sm font-mono ${className}`}>{children}</code>
}
