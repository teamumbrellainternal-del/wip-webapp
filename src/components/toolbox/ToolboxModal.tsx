/**
 * ToolboxModal Component
 * Main modal for artist toolbox with three tool options:
 * - Message Fans (Broadcast)
 * - My Files (File Manager)
 * - Creative Studio (Text scratchpad)
 */

import { useState } from 'react'
import { Mail, FolderOpen, BookOpen } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Card, CardContent } from '@/components/ui/card'
import { UmbrellaIcon } from './ToolboxButton'
import MessageFansModal from './MessageFansModal'
import FilesModal from './FilesModal'
import CreativeStudioModal from './CreativeStudioModal'

interface ToolboxModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

type ActiveTool = 'none' | 'message-fans' | 'files' | 'studio'

const TOOLS = [
  {
    id: 'message-fans' as const,
    title: 'Message Fans',
    description: 'Send broadcast messages to your followers',
    icon: Mail,
    gradient: 'from-pink-500 to-rose-600',
    hoverGradient: 'hover:from-pink-600 hover:to-rose-700',
  },
  {
    id: 'files' as const,
    title: 'My Files',
    description: 'Manage your photos, videos, and audio',
    icon: FolderOpen,
    gradient: 'from-blue-500 to-indigo-600',
    hoverGradient: 'hover:from-blue-600 hover:to-indigo-700',
  },
  {
    id: 'studio' as const,
    title: 'Creative Studio',
    description: 'Your personal scratchpad for ideas',
    icon: BookOpen,
    gradient: 'from-amber-500 to-orange-600',
    hoverGradient: 'hover:from-amber-600 hover:to-orange-700',
  },
] as const

export function ToolboxModal({ open, onOpenChange }: ToolboxModalProps) {
  const [activeTool, setActiveTool] = useState<ActiveTool>('none')

  const handleToolClick = (toolId: ActiveTool) => {
    setActiveTool(toolId)
  }

  const handleToolClose = () => {
    setActiveTool('none')
  }

  const handleMainModalClose = (isOpen: boolean) => {
    if (!isOpen) {
      setActiveTool('none')
    }
    onOpenChange(isOpen)
  }

  return (
    <>
      <Dialog open={open && activeTool === 'none'} onOpenChange={handleMainModalClose}>
        <DialogContent className="max-w-2xl">
          <DialogHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-md">
                <UmbrellaIcon className="h-6 w-6" />
              </div>
              <div>
                <DialogTitle className="text-xl">Artist Toolbox</DialogTitle>
                <DialogDescription>
                  Access your creative tools and connect with your audience
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="grid gap-4 sm:grid-cols-3">
            {TOOLS.map((tool) => {
              const Icon = tool.icon
              return (
                <Card
                  key={tool.id}
                  className="cursor-pointer border-border/50 transition-all hover:border-border hover:shadow-md"
                  onClick={() => handleToolClick(tool.id)}
                >
                  <CardContent className="flex flex-col items-center gap-3 p-6 text-center">
                    <div
                      className={`flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br ${tool.gradient} text-white shadow-md transition-all ${tool.hoverGradient}`}
                    >
                      <Icon className="h-7 w-7" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{tool.title}</h3>
                      <p className="text-xs text-muted-foreground">{tool.description}</p>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </DialogContent>
      </Dialog>

      {/* Tool-specific modals */}
      <MessageFansModal
        open={open && activeTool === 'message-fans'}
        onOpenChange={(isOpen) => {
          if (!isOpen) handleToolClose()
        }}
        onBack={handleToolClose}
      />

      <FilesModal
        open={open && activeTool === 'files'}
        onOpenChange={(isOpen) => {
          if (!isOpen) handleToolClose()
        }}
        onBack={handleToolClose}
      />

      <CreativeStudioModal
        open={open && activeTool === 'studio'}
        onOpenChange={(isOpen) => {
          if (!isOpen) handleToolClose()
        }}
        onBack={handleToolClose}
      />
    </>
  )
}

export default ToolboxModal
