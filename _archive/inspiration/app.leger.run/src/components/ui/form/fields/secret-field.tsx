import type React from "react"
import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Eye, EyeOff } from "lucide-react"
import { cn } from "@/lib/utils"
import { FormDescription } from "@/components/ui/form"

interface SecretFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string
  description?: string
  error?: string
}

export function SecretField({ label, description, error, className, id, ...props }: SecretFieldProps) {
  const [visible, setVisible] = useState(false)
  const fieldId = id || label.toLowerCase().replace(/\s+/g, "-")

  return (
    <div className="space-y-2">
      <Label htmlFor={fieldId} className={error ? "text-destructive" : ""}>
        {label}
      </Label>
      <div className="relative">
        <Input
          id={fieldId}
          type={visible ? "text" : "password"}
          className={cn(error && "border-destructive", className)}
          {...props}
        />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
          onClick={() => setVisible(!visible)}
          aria-label={visible ? "Hide password" : "Show password"}
        >
          {visible ? (
            <EyeOff className="h-4 w-4 text-muted-foreground" />
          ) : (
            <Eye className="h-4 w-4 text-muted-foreground" />
          )}
        </Button>
      </div>
      {description && !error && <FormDescription>{description}</FormDescription>}
      {error && <p className="text-sm font-medium text-destructive">{error}</p>}
    </div>
  )
}
