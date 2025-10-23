import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { FormDescription } from "@/components/ui/form"

interface SameInformationCheckboxProps {
  id: string
  label: string
  description?: string
  checked: boolean
  onCheckedChange: (checked: boolean) => void
}

export function SameInformationCheckbox({
  id,
  label,
  description,
  checked,
  onCheckedChange,
}: SameInformationCheckboxProps) {
  return (
    <div className="flex items-start space-x-2 mt-1">
      <Checkbox id={id} checked={checked} onCheckedChange={onCheckedChange} className="mt-1" />
      <div className="space-y-1 leading-none">
        <Label htmlFor={id} className="text-sm font-normal">
          {label}
        </Label>
        {description && <FormDescription>{description}</FormDescription>}
      </div>
    </div>
  )
}
