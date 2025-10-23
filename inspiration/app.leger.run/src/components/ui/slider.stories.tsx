// src/components/ui/slider.stories.tsx
import type { Story } from '@ladle/react'
import { useState } from 'react'
import { Slider } from './slider'
import { Label } from './label'

export default {
  title: 'Form Fields / Slider',
}

export const Default: Story = () => {
  const [value, setValue] = useState([50])

  return (
    <div className="p-8 max-w-md space-y-4">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>CPU Allocation</Label>
          <span className="text-sm text-muted-foreground">{value[0]}%</span>
        </div>
        <Slider
          value={value}
          onValueChange={setValue}
          max={100}
          step={1}
        />
      </div>
    </div>
  )
}

Default.meta = {
  description: 'Single value slider with percentage display',
}

export const WithRange: Story = () => {
  const [value, setValue] = useState([20, 80])

  return (
    <div className="p-8 max-w-md space-y-4">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>Memory Range</Label>
          <span className="text-sm text-muted-foreground">
            {value[0]}MB - {value[1]}MB
          </span>
        </div>
        <Slider
          value={value}
          onValueChange={setValue}
          max={128}
          step={1}
        />
      </div>
    </div>
  )
}

WithRange.meta = {
  description: 'Range slider with min/max values',
}

export const Stepped: Story = () => {
  const [value, setValue] = useState([4])

  const labels = ['Nano', 'Micro', 'Small', 'Medium', 'Large']

  return (
    <div className="p-8 max-w-md space-y-4">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>Instance Size</Label>
          <span className="text-sm text-muted-foreground">
            {labels[value[0]]}
          </span>
        </div>
        <Slider
          value={value}
          onValueChange={setValue}
          max={4}
          step={1}
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          {labels.map((label, i) => (
            <span key={i}>{label}</span>
          ))}
        </div>
      </div>
    </div>
  )
}

Stepped.meta = {
  description: 'Stepped slider with labeled increments',
}

export const Multiple: Story = () => {
  const [cpu, setCpu] = useState([50])
  const [memory, setMemory] = useState([64])
  const [timeout, setTimeout] = useState([30])

  return (
    <div className="p-8 max-w-md space-y-6">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>CPU Limit</Label>
          <span className="text-sm text-muted-foreground">{cpu[0]}%</span>
        </div>
        <Slider value={cpu} onValueChange={setCpu} max={100} step={5} />
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>Memory Limit</Label>
          <span className="text-sm text-muted-foreground">{memory[0]}MB</span>
        </div>
        <Slider value={memory} onValueChange={setMemory} max={128} step={8} />
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>Timeout</Label>
          <span className="text-sm text-muted-foreground">{timeout[0]}s</span>
        </div>
        <Slider value={timeout} onValueChange={setTimeout} max={60} step={5} />
      </div>
    </div>
  )
}

Multiple.meta = {
  description: 'Multiple sliders for resource configuration',
}
