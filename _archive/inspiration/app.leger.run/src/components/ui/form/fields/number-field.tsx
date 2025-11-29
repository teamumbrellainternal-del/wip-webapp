import React from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import { FormDescription } from "@/components/ui/form"

interface NumberFieldProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'type' | 'step'> {
  label: string
  description?: string
  error?: string
  min?: number
  max?: number
  step?: number | string
  value?: number | string
  onChange?: (value: number | undefined) => void
}

export function NumberField({
  label,
  description,
  error,
  min,
  max,
  step = "any",
  value,
  onChange,
  className,
  id,
  ...props
}: NumberFieldProps) {
  const fieldId = id || label.toLowerCase().replace(/\s+/g, "-")

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value
    if (inputValue === "") {
      onChange?.(undefined)
      return
    }
    
    const numericValue = parseFloat(inputValue)
    if (!isNaN(numericValue)) {
      onChange?.(numericValue)
    }
  }

  const displayValue = value === undefined ? "" : value.toString()

  return (
    <div className="space-y-2">
      <Label htmlFor={fieldId} className={error ? "text-destructive" : ""}>
        {label}
      </Label>
      <Input
        id={fieldId}
        type="number"
        className={cn(error && "border-destructive", className)}
        min={min}
        max={max}
        step={step}
        value={displayValue}
        onChange={handleChange}
        {...props}
      />
      {description && !error && <FormDescription>{description}</FormDescription>}
      {error && <p className="text-sm font-medium text-destructive">{error}</p>}
    </div>
  )
}