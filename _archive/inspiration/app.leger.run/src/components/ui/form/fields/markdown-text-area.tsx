import type React from "react"

import { useState } from "react"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { FormDescription } from "@/components/ui/form"
import { cn } from "@/lib/utils"
import { ExternalLink } from "lucide-react"

interface MarkdownTextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string
  description?: string
  maxLength?: number
  error?: string
  markdownDocsUrl?: string
}

export function MarkdownTextArea({
  label,
  description,
  maxLength,
  error,
  markdownDocsUrl = "https://docs.github.com/en/github/writing-on-github/getting-started-with-writing-and-formatting-on-github/basic-writing-and-formatting-syntax",
  className,
  id,
  ...props
}: MarkdownTextAreaProps) {
  const [charCount, setCharCount] = useState(props.value?.toString().length || 0)
  const fieldId = id || label.toLowerCase().replace(/\s+/g, "-")

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCharCount(e.target.value.length)
    props.onChange?.(e)
  }

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <Label htmlFor={fieldId} className={error ? "text-destructive" : ""}>
          {label}
        </Label>
        {maxLength && (
          <span
            className={cn(
              "text-xs text-muted-foreground",
              charCount > maxLength * 0.8 && "text-amber-500",
              charCount >= maxLength && "text-destructive",
            )}
          >
            {charCount}/{maxLength}
          </span>
        )}
      </div>
      <Textarea
        id={fieldId}
        className={cn("min-h-[120px] font-mono text-sm", error && "border-destructive", className)}
        maxLength={maxLength}
        onChange={handleChange}
        {...props}
      />
      <div className="flex justify-between items-center">
        {(description || error) && (
          <div>
            {description && !error && <FormDescription>{description}</FormDescription>}
            {error && <p className="text-sm font-medium text-destructive">{error}</p>}
          </div>
        )}
        <a
          href={markdownDocsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1"
        >
          Markdown is supported
          <ExternalLink className="h-3 w-3" />
        </a>
      </div>
    </div>
  )
}
