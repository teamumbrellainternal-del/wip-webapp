import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { FormDescription } from "@/components/ui/form"
import { HelpCircle } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useState } from "react"

interface CommandFieldGroupProps {
  label: string
  description?: string
  defaultValue: string
  value: string
  onChange: (value: string) => void
  helpText?: string
  id?: string
}

export function CommandFieldGroup({
  label,
  description,
  defaultValue,
  value,
  onChange,
  helpText,
  id,
}: CommandFieldGroupProps) {
  const [isOverridden, setIsOverridden] = useState(value !== defaultValue)
  const fieldId = id || label.toLowerCase().replace(/\s+/g, "-")

  const handleOverrideChange = (checked: boolean) => {
    setIsOverridden(checked)
    if (!checked) {
      onChange(defaultValue)
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Label htmlFor={fieldId}>{label}</Label>
          {helpText && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="h-4 w-4 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-xs">{helpText}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Override</span>
          <Switch checked={isOverridden} onCheckedChange={handleOverrideChange} />
        </div>
      </div>
      <Input
        id={fieldId}
        value={isOverridden ? value : defaultValue}
        onChange={(e) => onChange(e.target.value)}
        className={!isOverridden ? "bg-muted text-muted-foreground" : ""}
        readOnly={!isOverridden}
      />
      {description && <FormDescription>{description}</FormDescription>}
    </div>
  )
}
