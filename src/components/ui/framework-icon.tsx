import { cn } from "@/lib/utils"

interface FrameworkIconProps {
  framework: string
  size?: number
  className?: string
}

export function FrameworkIcon({ framework, size = 20, className }: FrameworkIconProps) {
  // This would normally use real framework icons
  const iconMap: Record<string, string> = {
    next: "/placeholder.svg?height=20&width=20",
    react: "/placeholder.svg?height=20&width=20",
    vue: "/placeholder.svg?height=20&width=20",
    angular: "/placeholder.svg?height=20&width=20",
    svelte: "/placeholder.svg?height=20&width=20",
  }

  const iconUrl = iconMap[framework.toLowerCase()] || "/placeholder.svg?height=20&width=20"

  return (
    <div className={cn("relative", className)} style={{ width: size, height: size }}>
      <img
        src={iconUrl || "/placeholder.svg"}
        alt={`${framework} icon`}
        width={size}
        height={size}
        className="object-contain"
      />
    </div>
  )
}
