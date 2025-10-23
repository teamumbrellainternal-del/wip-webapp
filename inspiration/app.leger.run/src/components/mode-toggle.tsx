import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { FileText, Settings } from 'lucide-react'
import type { AppMode } from '@/types'

interface ModeToggleProps {
  mode: AppMode
  onModeChange: (mode: AppMode) => void
  disabled?: boolean
}

export function ModeToggle({ mode, onModeChange, disabled }: ModeToggleProps) {
  return (
    <Card className="mb-6">
      <CardContent className="pt-6">
        <div className="flex items-center justify-center space-x-1">
          <Button
            variant={mode === 'form' ? 'default' : 'outline'}
            size="sm"
            onClick={() => onModeChange('form')}
            disabled={disabled}
            className="flex items-center gap-2"
          >
            <Settings className="w-4 h-4" />
            Form Mode
          </Button>
          <Button
            variant={mode === 'raw' ? 'default' : 'outline'}
            size="sm"
            onClick={() => onModeChange('raw')}
            disabled={disabled}
            className="flex items-center gap-2"
          >
            <FileText className="w-4 h-4" />
            Raw Editor
          </Button>
        </div>
        <div className="text-center mt-3">
          <div className="text-sm text-muted-foreground">
            {mode === 'form' ? (
              'Use the visual form to configure OpenWebUI settings'
            ) : (
              'Edit the raw .env configuration directly'
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}