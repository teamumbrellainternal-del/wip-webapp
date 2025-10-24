/**
 * Container Component
 * Simple container wrapper with consistent padding
 *
 * Features:
 * - Max-width container with centered content
 * - Responsive horizontal padding
 * - Optional className for customization
 */

import { cn } from '@/lib/utils'

interface ContainerProps {
  children: React.ReactNode
  className?: string
}

export default function Container({ children, className = '' }: ContainerProps) {
  return (
    <div className={cn('container mx-auto px-4', className)}>
      {children}
    </div>
  )
}

// Also export the named function for backwards compatibility
export { Container }
