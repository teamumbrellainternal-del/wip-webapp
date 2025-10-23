import type React from "react"
import { ExternalLink } from "lucide-react"

interface DocumentationLinkProps {
  href: string
  children: React.ReactNode
  className?: string
}

export function DocumentationLink({ href, children, className }: DocumentationLinkProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary hover:underline ${className}`}
    >
      {children}
      <ExternalLink className="h-3 w-3" />
    </a>
  )
}
