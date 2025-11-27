/**
 * Violet Chat Message Component
 * Displays user and assistant messages with proper styling per Figma
 * Uses react-markdown for rendering formatted AI responses
 */

import { Sparkles } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import ReactMarkdown from 'react-markdown'
import type { VioletMessage } from '@/types'

interface ChatMessageProps {
  message: VioletMessage
}

/**
 * Format timestamp for display (e.g., "02:03 PM")
 */
function formatTimestamp(isoString: string): string {
  const date = new Date(isoString)
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  })
}

/**
 * Get mood badge color classes
 */
function getMoodClasses(mood: string | null): string {
  switch (mood) {
    case 'caring':
      return 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300'
    case 'playful':
      return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300'
    case 'professional':
    default:
      return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
  }
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === 'user'

  if (isUser) {
    // User message - right-aligned, pink/magenta bubble
    return (
      <div className="flex justify-end">
        <div className="max-w-[80%] space-y-1">
          <div className="rounded-2xl rounded-br-md bg-gradient-to-r from-pink-500 to-fuchsia-500 px-4 py-3 text-white">
            <p className="whitespace-pre-wrap text-sm">{message.content}</p>
          </div>
          <p className="text-right text-xs text-muted-foreground">
            {formatTimestamp(message.created_at)}
          </p>
        </div>
      </div>
    )
  }

  // Assistant (Violet) message - left-aligned with avatar and markdown rendering
  return (
    <div className="flex gap-3">
      {/* Violet Avatar */}
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-teal-400 to-emerald-500">
        <Sparkles className="h-4 w-4 text-white" />
      </div>

      <div className="max-w-[80%] space-y-1">
        {/* Header with name and mood badge */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-foreground">Violet</span>
          {message.mood && (
            <Badge variant="secondary" className={cn('text-xs', getMoodClasses(message.mood))}>
              {message.mood}
            </Badge>
          )}
        </div>

        {/* Message content with markdown rendering */}
        <div className="rounded-2xl rounded-tl-md bg-muted/50 px-4 py-3">
          <div className="prose prose-sm max-w-none text-foreground dark:prose-invert prose-headings:text-foreground prose-p:text-foreground prose-strong:text-foreground prose-ul:text-foreground prose-li:text-foreground">
            <ReactMarkdown>{message.content}</ReactMarkdown>
          </div>
        </div>

        {/* Timestamp */}
        <p className="text-xs text-muted-foreground">{formatTimestamp(message.created_at)}</p>
      </div>
    </div>
  )
}
