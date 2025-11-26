import { ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface OnboardingLayoutProps {
  children: ReactNode
  currentStep: number
  totalSteps?: number
  showBack?: boolean
  backPath?: string
}

export default function OnboardingLayout({
  children,
  currentStep,
  totalSteps = 4,
  showBack = true,
  backPath,
}: OnboardingLayoutProps) {
  const navigate = useNavigate()
  const progress = (currentStep / totalSteps) * 100

  const handleBack = () => {
    if (backPath) {
      navigate(backPath)
    } else {
      navigate(-1)
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-purple-50 via-white to-pink-50 dark:from-slate-950 dark:via-slate-900 dark:to-purple-950">
      {/* Header with Progress */}
      <div className="sticky top-0 z-10 border-b border-border/40 bg-background/80 px-4 py-4 backdrop-blur-sm">
        <div className="mx-auto flex max-w-2xl items-center gap-4">
          {showBack && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBack}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
          )}

          {/* Progress Bar */}
          <div className="flex flex-1 flex-col gap-1">
            <div className="h-2 w-full overflow-hidden rounded-full bg-purple-100 dark:bg-purple-900/30">
              <div
                className="h-full rounded-full bg-purple-500 transition-all duration-500 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="text-right text-xs text-muted-foreground">
              Step {currentStep} of {totalSteps}
            </span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-1 items-start justify-center px-4 py-8">
        <div className="w-full max-w-2xl">{children}</div>
      </div>
    </div>
  )
}

