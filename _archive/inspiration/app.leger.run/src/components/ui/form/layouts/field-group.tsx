import type React from "react"
import { cn } from "@/lib/utils"

interface FieldGroupProps {
  children: React.ReactNode
  className?: string
}

export function FieldGroup({ children, className }: FieldGroupProps) {
  return <div className={cn("space-y-4", className)}>{children}</div>
}
