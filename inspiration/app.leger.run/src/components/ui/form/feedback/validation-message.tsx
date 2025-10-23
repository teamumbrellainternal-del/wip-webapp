import { AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"

interface ValidationMessageProps {
  message: string
  className?: string
}

export function ValidationMessage({ message, className }: ValidationMessageProps) {
  return (
    <div className={cn("flex items-center gap-2 text-destructive text-sm font-medium", className)}>
      <AlertCircle className="h-4 w-4" />
      <span>{message}</span>
    </div>
  )
}
