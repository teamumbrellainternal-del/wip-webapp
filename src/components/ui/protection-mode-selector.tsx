import { Button } from "@/components/ui/button"

import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { FormDescription } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ConditionalField } from "../form/wrappers/conditional-field"
import { HelpCircle } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface ProtectionModeSelectorProps {
  enabled: boolean
  onEnabledChange: (enabled: boolean) => void
  mode: string
  onModeChange: (mode: string) => void
  description?: string
}

export function ProtectionModeSelector({
  enabled,
  onEnabledChange,
  mode,
  onModeChange,
  description,
}: ProtectionModeSelectorProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <Label htmlFor="protection-toggle">Authentication</Label>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-6 w-6">
                    <HelpCircle className="h-4 w-4 text-muted-foreground" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-xs">
                    When enabled, users will need to authenticate before accessing your deployment.
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          {description && <FormDescription>{description}</FormDescription>}
        </div>
        <Switch id="protection-toggle" checked={enabled} onCheckedChange={onEnabledChange} />
      </div>

      <ConditionalField show={enabled}>
        <div className="space-y-2">
          <Label htmlFor="protection-mode">Protection Mode</Label>
          <Select value={mode} onValueChange={onModeChange}>
            <SelectTrigger id="protection-mode">
              <SelectValue placeholder="Select protection mode" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="basic">Basic Auth</SelectItem>
              <SelectItem value="oauth">OAuth</SelectItem>
              <SelectItem value="jwt">JWT</SelectItem>
            </SelectContent>
          </Select>
          <FormDescription>Choose how users will authenticate to access your deployment.</FormDescription>
        </div>
      </ConditionalField>
    </div>
  )
}
