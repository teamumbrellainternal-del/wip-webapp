// src/components/ui/progress.stories.tsx
import type { Story } from '@ladle/react'
import { useState, useEffect } from 'react'
import { Progress } from './progress'
import { Label } from './label'

export default {
  title: 'Feedback / Progress',
}

export const Default: Story = () => (
  <div className="p-8 max-w-md space-y-4">
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label>Build Progress</Label>
        <span className="text-sm text-muted-foreground">66%</span>
      </div>
      <Progress value={66} />
    </div>
  </div>
)

Default.meta = {
  description: 'Progress bar showing completion percentage',
}

export const Animated: Story = () => {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) return 0
        return prev + 10
      })
    }, 500)

    return () => clearInterval(timer)
  }, [])

  return (
    <div className="p-8 max-w-md space-y-4">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>Deployment Progress</Label>
          <span className="text-sm text-muted-foreground">{progress}%</span>
        </div>
        <Progress value={progress} />
      </div>
    </div>
  )
}

Animated.meta = {
  description: 'Animated progress bar',
}

export const Multiple: Story = () => (
  <div className="p-8 max-w-md space-y-6">
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label>Building...</Label>
        <span className="text-sm text-muted-foreground">100%</span>
      </div>
      <Progress value={100} />
    </div>

    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label>Deploying...</Label>
        <span className="text-sm text-muted-foreground">75%</span>
      </div>
      <Progress value={75} />
    </div>

    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label>Starting service...</Label>
        <span className="text-sm text-muted-foreground">30%</span>
      </div>
      <Progress value={30} />
    </div>

    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label>Running tests...</Label>
        <span className="text-sm text-muted-foreground">0%</span>
      </div>
      <Progress value={0} />
    </div>
  </div>
)

Multiple.meta = {
  description: 'Multiple progress bars for deployment pipeline',
}

export const States: Story = () => (
  <div className="p-8 max-w-md space-y-6">
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label>Starting...</Label>
        <span className="text-sm text-muted-foreground">5%</span>
      </div>
      <Progress value={5} />
    </div>

    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label>In Progress</Label>
        <span className="text-sm text-muted-foreground">50%</span>
      </div>
      <Progress value={50} />
    </div>

    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label>Almost Done</Label>
        <span className="text-sm text-muted-foreground">95%</span>
      </div>
      <Progress value={95} />
    </div>

    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label>Complete</Label>
        <span className="text-sm text-muted-foreground text-green-500">100%</span>
      </div>
      <Progress value={100} className="[&>div]:bg-green-500" />
    </div>
  </div>
)

States.meta = {
  description: 'Progress bars at different completion states',
}
