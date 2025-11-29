import type React from "react"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { FormDescription } from "@/components/ui/form"
import { cn } from "@/lib/utils"

interface URLInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string
  description?: string
  error?: string
  prefix?: string
}

export function URLInput({ label, description, error, prefix, className, id, ...props }: URLInputProps) {
  const fieldId = id || label.toLowerCase().replace(/\s+/g, "-")

  return (
    <div className="space-y-2">
      <Label htmlFor={fieldId} className={error ? "text-destructive" : ""}>
        {label}
      </Label>
      <div className="relative">
        {prefix && (
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <span className="text-sm text-muted-foreground">{prefix}</span>
          </div>
        )}
        <Input
          id={fieldId}
          type="url"
          className={cn(error && "border-destructive", prefix && "pl-[calc(0.75rem+var(--prefix-width))]", className)}
          style={{ "--prefix-width": prefix ? `${prefix.length}ch` : "0ch" } as React.CSSProperties}
          {...props}
        />
      </div>
      {description && !error && <FormDescription>{description}</FormDescription>}
      {error && <p className="text-sm font-medium text-destructive">{error}</p>}
    </div>
  )
}
