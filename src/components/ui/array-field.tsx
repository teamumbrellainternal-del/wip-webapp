import type React from "react"
import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Plus, X } from "lucide-react"
import { FormDescription } from "@/components/ui/form"

interface ArrayFieldProps {
  label: string
  description?: string
  values: string[]
  onChange: (values: string[]) => void
  placeholder?: string
  addButtonText?: string
  maxItems?: number
  id?: string
}

export function ArrayField({
  label,
  description,
  values,
  onChange,
  placeholder = "Enter a value",
  maxItems,
  id,
}: ArrayFieldProps) {
  const [newValue, setNewValue] = useState("")
  const fieldId = id || label.toLowerCase().replace(/\s+/g, "-")

  const handleAdd = () => {
    if (newValue.trim() && (!maxItems || values.length < maxItems)) {
      onChange([...values, newValue.trim()])
      setNewValue("")
    }
  }

  const handleRemove = (index: number) => {
    const newValues = [...values]
    newValues.splice(index, 1)
    onChange(newValues)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault()
      handleAdd()
    }
  }

  return (
    <div className="space-y-2">
      <Label htmlFor={fieldId}>{label}</Label>
      {description && <FormDescription>{description}</FormDescription>}

      <div className="space-y-2">
        {values.map((value, index) => (
          <div key={index} className="flex items-center gap-2">
            <Input value={value} readOnly className="flex-1" />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => handleRemove(index)}
              aria-label={`Remove ${value}`}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ))}

        <div className="flex items-center gap-2">
          <Input
            id={fieldId}
            value={newValue}
            onChange={(e) => setNewValue(e.target.value)}
            placeholder={placeholder}
            onKeyDown={handleKeyDown}
            className="flex-1"
            disabled={maxItems !== undefined && values.length >= maxItems}
          />
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={handleAdd}
            disabled={!newValue.trim() || (maxItems !== undefined && values.length >= maxItems)}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        {maxItems !== undefined && (
          <p className="text-xs text-muted-foreground">
            {values.length} of {maxItems} items
          </p>
        )}
      </div>
    </div>
  )
}
