import type React from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { FormDescription } from "@/components/ui/form"
import { cn } from "@/lib/utils"

interface OverrideableFieldProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value' | 'defaultValue'> {
  label: string
  description?: string
  defaultValue: string
  value: string
  onChange: (value: string) => void
  overridden: boolean
  onOverrideChange: (overridden: boolean) => void
  id?: string
}

export function OverrideableField({
  label,
  description,
  defaultValue,
  value,
  onChange,
  overridden,
  onOverrideChange,
  className,
  id,
  ...props
}: OverrideableFieldProps) {
  const fieldId = id || label.toLowerCase().replace(/\s+/g, "-")

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value)
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label htmlFor={fieldId}>{label}</Label>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Override</span>
          <Switch checked={overridden} onCheckedChange={onOverrideChange} />
        </div>
      </div>
      <Input
        id={fieldId}
        value={overridden ? value : defaultValue}
        onChange={handleInputChange}
        className={cn(!overridden && "bg-muted text-muted-foreground", className)}
        readOnly={!overridden}
        {...props}
      />
      {description && <FormDescription>{description}</FormDescription>}
    </div>
  )
}
