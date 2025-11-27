/**
 * Violet Chat Input Component
 * Fixed bottom input with send button per Figma design
 */

import { useState, useRef, useEffect } from 'react'
import { Send, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'

interface ChatInputProps {
  onSend: (content: string) => void
  disabled?: boolean
  isLoading?: boolean
  placeholder?: string
  remainingPrompts?: number
}

export function ChatInput({
  onSend,
  disabled = false,
  isLoading = false,
  placeholder = 'Ask Violet anything... (e.g., Find venues, help with mixing, draft an email blast)',
  remainingPrompts,
}: ChatInputProps) {
  const [value, setValue] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current
    if (textarea) {
      textarea.style.height = 'auto'
      textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`
    }
  }, [value])

  const handleSubmit = () => {
    const trimmed = value.trim()
    if (!trimmed || disabled || isLoading) return

    onSend(trimmed)
    setValue('')

    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  const isDisabled = disabled || isLoading || !value.trim()

  return (
    <div className="border-t border-border/50 bg-background px-4 py-3">
      {/* Input area */}
      <div className="flex items-end gap-2">
        <div className="relative flex-1">
          <Textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled || isLoading}
            className="max-h-[120px] min-h-[44px] resize-none pr-12 text-sm"
            rows={1}
          />
        </div>

        <Button
          onClick={handleSubmit}
          disabled={isDisabled}
          size="icon"
          className="h-11 w-11 shrink-0 rounded-full bg-gradient-to-r from-purple-500 to-fuchsia-500 hover:from-purple-600 hover:to-fuchsia-600"
          aria-label="Send message"
        >
          {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
        </Button>
      </div>

      {/* Footer text */}
      <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
        <span>From your next gig to your next song, I've got you covered. 💜</span>
        {remainingPrompts !== undefined && <span>{remainingPrompts} prompts remaining today</span>}
      </div>
    </div>
  )
}
