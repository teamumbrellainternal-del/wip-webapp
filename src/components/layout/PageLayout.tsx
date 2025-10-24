/**
 * PageLayout Component
 * Consistent page wrapper with optional header and sidebar
 *
 * Features:
 * - Page header with back button, title, subtitle, action buttons
 * - Main content area (scrollable)
 * - Optional right sidebar
 * - Responsive: sidebar collapses on mobile
 */

import React from 'react'
import { BackButton } from './BackButton'

interface PageLayoutProps {
  title?: string
  subtitle?: string
  backLink?: string
  actions?: React.ReactNode
  sidebar?: React.ReactNode
  children: React.ReactNode
  className?: string
}

export default function PageLayout({
  title,
  subtitle,
  backLink,
  actions,
  sidebar,
  children,
  className = '',
}: PageLayoutProps) {
  return (
    <div className={`container mx-auto px-4 py-8 ${className}`}>
      {/* Optional Header */}
      {(title || backLink) && (
        <div className="mb-8">
          {backLink && <BackButton to={backLink} />}
          {title && (
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
                {subtitle && (
                  <p className="text-muted-foreground mt-2">{subtitle}</p>
                )}
              </div>
              {actions && <div className="flex items-center gap-2">{actions}</div>}
            </div>
          )}
        </div>
      )}

      {/* Content + Optional Sidebar */}
      <div
        className={
          sidebar
            ? 'grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-8'
            : ''
        }
      >
        <div className="min-w-0">{children}</div>
        {sidebar && (
          <aside className="lg:sticky lg:top-24 lg:self-start h-fit">
            {sidebar}
          </aside>
        )}
      </div>
    </div>
  )
}

// Also export the named function for backwards compatibility
export { PageLayout }
