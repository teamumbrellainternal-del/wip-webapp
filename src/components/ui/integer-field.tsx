import React from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import { FormDescription } from "@/components/ui/form"

interface IntegerFieldProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'type' | 'step'> {
  label: string
  description?: string
  error?: string
  min?: number
  max?: number
  value?: number | string
  onChange?: (value: number | undefined) => void
}

export function IntegerField({
  label,
  description,
  error,
  min,
  max,
  value,
  onChange,
  className,
  id,
  ...props
}: IntegerFieldProps) {
  const fieldId = id || label.toLowerCase().replace(/\s+/g, "-")

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let inputValue = e.target.value
    
    // Remove any non-digit characters except minus sign at the beginning
    inputValue = inputValue.replace(/[^-0-9]/g, '')
    
    // Ensure only one minus sign at the beginning
    if (inputValue.indexOf('-') > 0) {
      inputValue = inputValue.replace(/-/g, '')
    }
    
    // Update the input value to sanitized version
    e.target.value = inputValue
    
    if (inputValue === "" || inputValue === "-") {
      onChange?.(undefined)
      return
    }
    
    const integerValue = parseInt(inputValue, 10)
    if (!isNaN(integerValue)) {
      onChange?.(integerValue)
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
        step="1"
        className={cn(error && "border-destructive", className)}
        min={min}
        max={max}
        value={displayValue}
        onChange={handleChange}
        {...props}
      />
      {description && !error && <FormDescription>{description}</FormDescription>}
      {error && <p className="text-sm font-medium text-destructive">{error}</p>}
    </div>
  )
}