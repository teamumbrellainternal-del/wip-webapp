import React from "react"
import { Calendar as CalendarIcon } from "lucide-react"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { FormDescription } from "@/components/ui/form"
import { cn } from "@/lib/utils"

interface DateFieldProps {
  label: string
  description?: string
  error?: string
  value?: Date | string
  onChange?: (date: Date | undefined) => void
  placeholder?: string
  disabled?: boolean
  id?: string
  dateFormat?: "short" | "medium" | "long" | "full"
  minDate?: Date
  maxDate?: Date
}

export function DateField({
  label,
  description,
  error,
  value,
  onChange,
  placeholder = "Pick a date",
  disabled = false,
  id,
  dateFormat = "medium",
  minDate,
  maxDate,
}: DateFieldProps) {
  const fieldId = id || label.toLowerCase().replace(/\s+/g, "-")
  const [open, setOpen] = React.useState(false)
  
  const selectedDate = React.useMemo(() => {
    if (!value) return undefined
    if (value instanceof Date) return value
    const parsedDate = new Date(value)
    return isNaN(parsedDate.getTime()) ? undefined : parsedDate
  }, [value])

  const handleSelect = (date: Date | undefined) => {
    onChange?.(date)
    setOpen(false)
  }

  const formatDisplayDate = (date: Date | undefined) => {
    if (!date) return placeholder
    
    const options: Intl.DateTimeFormatOptions = {}
    switch (dateFormat) {
      case "short":
        options.dateStyle = "short"
        break
      case "medium":
        options.dateStyle = "medium"
        break
      case "long":
        options.dateStyle = "long"
        break
      case "full":
        options.dateStyle = "full"
        break
      default:
        options.dateStyle = "medium"
    }
    
    return date.toLocaleDateString(undefined, options)
  }

  return (
    <div className="space-y-2">
      <Label htmlFor={fieldId} className={error ? "text-destructive" : ""}>
        {label}
      </Label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            id={fieldId}
            variant="outline"
            className={cn(
              "w-full justify-start text-left font-normal",
              !selectedDate && "text-muted-foreground",
              error && "border-destructive"
            )}
            disabled={disabled}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {formatDisplayDate(selectedDate)}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={handleSelect}
            disabled={(date) => {
              if (minDate && date < minDate) return true
              if (maxDate && date > maxDate) return true
              return false
            }}
            initialFocus
          />
        </PopoverContent>
      </Popover>
      {description && !error && <FormDescription>{description}</FormDescription>}
      {error && <p className="text-sm font-medium text-destructive">{error}</p>}
    </div>
  )
}