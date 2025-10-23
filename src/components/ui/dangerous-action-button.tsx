import type React from "react"
import { Button, type ButtonProps } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface DangerousActionButtonProps extends ButtonProps {
  children: React.ReactNode
}

export function DangerousActionButton({ children, className, ...props }: DangerousActionButtonProps) {
  return (
    <Button variant="destructive" className={cn("bg-destructive/90 hover:bg-destructive", className)} {...props}>
      {children}
    </Button>
  )
}
