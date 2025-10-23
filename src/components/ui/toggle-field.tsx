import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { FormDescription } from "@/components/ui/form"

interface ToggleFieldProps {
  label: string
  description?: string
  checked: boolean
  onCheckedChange: (checked: boolean) => void
  disabled?: boolean
  id?: string
}

export function ToggleField({ label, description, checked, onCheckedChange, disabled, id }: ToggleFieldProps) {
  const fieldId = id || label.toLowerCase().replace(/\s+/g, "-")

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <Label htmlFor={fieldId}>{label}</Label>
          {description && <FormDescription>{description}</FormDescription>}
        </div>
        <Switch id={fieldId} checked={checked} onCheckedChange={onCheckedChange} disabled={disabled} />
      </div>
    </div>
  )
}
