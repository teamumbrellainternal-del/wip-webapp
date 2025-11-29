import { Label } from "@/components/ui/label"
import { FormDescription } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FrameworkIcon } from "./framework-icon"

interface Framework {
  id: string
  name: string
  icon?: string
}

interface FrameworkPresetSelectorProps {
  frameworks: Framework[]
  value: string
  onChange: (value: string) => void
  label?: string
  description?: string
}

export function FrameworkPresetSelector({
  frameworks,
  value,
  onChange,
  label = "Framework Preset",
  description,
}: FrameworkPresetSelectorProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="framework-preset">{label}</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger id="framework-preset" className="w-full">
          <SelectValue placeholder="Select framework" />
        </SelectTrigger>
        <SelectContent>
          {frameworks.map((framework) => (
            <SelectItem key={framework.id} value={framework.id}>
              <div className="flex items-center gap-2">
                <FrameworkIcon framework={framework.id} size={16} />
                <span>{framework.name}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {description && <FormDescription>{description}</FormDescription>}
    </div>
  )
}
