/**
 * Violet Chat Header Component
 * Displays back navigation, avatar, and title per Figma design
 */

import { ArrowLeft, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useNavigate } from 'react-router-dom'

interface ChatHeaderProps {
  onBack?: () => void
}

export function ChatHeader({ onBack }: ChatHeaderProps) {
  const navigate = useNavigate()

  const handleBack = () => {
    if (onBack) {
      onBack()
    } else {
      navigate('/violet')
    }
  }

  return (
    <header className="flex items-center gap-4 border-b border-border/50 bg-background px-4 py-3">
      <Button
        variant="ghost"
        size="icon"
        onClick={handleBack}
        className="h-9 w-9 shrink-0"
        aria-label="Go back"
      >
        <ArrowLeft className="h-5 w-5" />
      </Button>

      <div className="flex items-center gap-3">
        {/* Violet Avatar */}
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-teal-400 to-emerald-500">
          <Sparkles className="h-5 w-5 text-white" />
        </div>

        {/* Title */}
        <div>
          <h1 className="text-lg font-semibold text-foreground">Violet</h1>
          <p className="text-xs text-muted-foreground">Your AI Creative Copilot</p>
        </div>
      </div>
    </header>
  )
}
