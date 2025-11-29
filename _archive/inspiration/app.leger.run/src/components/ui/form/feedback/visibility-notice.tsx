import { Eye, EyeOff } from "lucide-react"
import { cn } from "@/lib/utils"

interface VisibilityNoticeProps {
  isPublic: boolean
  className?: string
}

export function VisibilityNotice({ isPublic, className }: VisibilityNoticeProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-1 text-xs rounded-full px-2 py-0.5",
        isPublic
          ? "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400"
          : "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
        className,
      )}
    >
      {isPublic ? (
        <>
          <Eye className="h-3 w-3" />
          <span>Publicly visible</span>
        </>
      ) : (
        <>
          <EyeOff className="h-3 w-3" />
          <span>Private</span>
        </>
      )}
    </div>
  )
}
