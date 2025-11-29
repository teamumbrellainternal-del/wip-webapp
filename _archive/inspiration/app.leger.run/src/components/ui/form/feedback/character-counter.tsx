import { cn } from "@/lib/utils"

interface CharacterCounterProps {
  current: number
  maximum: number
  className?: string
}

export function CharacterCounter({ current, maximum, className }: CharacterCounterProps) {
  const isNearLimit = current > maximum * 0.8
  const isAtLimit = current >= maximum

  return (
    <span
      className={cn(
        "text-xs text-muted-foreground",
        isNearLimit && !isAtLimit && "text-amber-500",
        isAtLimit && "text-destructive",
        className,
      )}
    >
      {current}/{maximum}
    </span>
  )
}
