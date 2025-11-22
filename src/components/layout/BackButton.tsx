/**
 * BackButton Component
 * Back navigation button with optional link or browser back
 *
 * Features:
 * - Optional 'to' prop for specific navigation
 * - Falls back to browser back if no 'to' prop provided
 * - Accessible with keyboard navigation
 */

import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface BackButtonProps {
  to?: string // optional link, otherwise uses browser back
  children?: React.ReactNode
}

export function BackButton({ to, children }: BackButtonProps) {
  const navigate = useNavigate()

  const handleClick = () => {
    if (to) {
      navigate(to)
    } else {
      navigate(-1) // browser back
    }
  }

  return (
    <Button variant="ghost" size="sm" onClick={handleClick} className="-ml-2 mb-4">
      <ArrowLeft className="mr-2 h-4 w-4" />
      {children || 'Back'}
    </Button>
  )
}
