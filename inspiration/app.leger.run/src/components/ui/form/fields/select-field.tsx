import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { FormDescription } from "@/components/ui/form"

interface SelectOption {
  value: string
  label: string
}

interface SelectFieldProps {
  label: string
  description?: string
  options: SelectOption[]
  value: string
  onChange: (value: string) => void
  placeholder?: string
  error?: string
  disabled?: boolean
  id?: string
}

export function SelectField({
  label,
  description,
  options,
  value,
  onChange,
  placeholder = "Select an option",
  error,
  disabled,
  id,
}: SelectFieldProps) {
  const fieldId = id || label.toLowerCase().replace(/\s+/g, "-")

  return (
    <div className="space-y-2">
      <Label htmlFor={fieldId} className={error ? "text-destructive" : ""}>
        {label}
      </Label>
      <Select value={value} onValueChange={onChange} disabled={disabled}>
        <SelectTrigger id={fieldId} className={error ? "border-destructive" : ""}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {description && !error && <FormDescription>{description}</FormDescription>}
      {error && <p className="text-sm font-medium text-destructive">{error}</p>}
    </div>
  )
}
