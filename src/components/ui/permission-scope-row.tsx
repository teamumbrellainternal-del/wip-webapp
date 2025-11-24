import { HelpCircle } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

interface PermissionScopeRowProps {
  name: string
  description: string
  value: string
  onChange: (value: string) => void
  options: Array<{ value: string; label: string }>
  helpText?: string
  disabled?: boolean
}

export function PermissionScopeRow({
  name,
  description,
  value,
  onChange,
  options,
  helpText,
  disabled = false,
}: PermissionScopeRowProps) {
  return (
    <div className="flex flex-col border-b py-3 last:border-b-0 sm:flex-row sm:items-center">
      <div className="mb-2 flex-1 space-y-1 sm:mb-0">
        <div className="flex items-center gap-1.5">
          <h4 className="text-sm font-medium">{name}</h4>
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
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <div className="w-full sm:w-[180px]">
        <Select value={value} onValueChange={onChange} disabled={disabled}>
          <SelectTrigger>
            <SelectValue placeholder="Select permission" />
          </SelectTrigger>
          <SelectContent>
            {options.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
