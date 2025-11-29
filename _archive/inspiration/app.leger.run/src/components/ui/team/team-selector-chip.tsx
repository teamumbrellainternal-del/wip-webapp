import { Button } from "@/components/ui/button"
import { X } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface Team {
  id: string
  name: string
  slug: string
  avatar?: string
  color?: string
}

interface TeamSelectorChipProps {
  team: Team | null
  onRemove: () => void
  disabled?: boolean
}

export function TeamSelectorChip({ team, onRemove, disabled = false }: TeamSelectorChipProps) {
  if (!team) return null

  return (
    <div
      className="inline-flex items-center gap-2 rounded-md border px-3 py-1.5 text-sm"
      style={{ borderColor: team.color ? `${team.color}50` : undefined }}
    >
      <Avatar className="h-5 w-5">
        <AvatarImage src={team.avatar || "/placeholder.svg"} alt={team.name} />
        <AvatarFallback style={{ backgroundColor: team.color || "#e2e8f0" }} className="text-[10px] text-white">
          {team.name
            .split(" ")
            .map((word) => word[0])
            .join("")
            .toUpperCase()
            .substring(0, 2)}
        </AvatarFallback>
      </Avatar>
      <span>{team.name}</span>
      {!disabled && (
        <Button
          variant="ghost"
          size="icon"
          className="h-4 w-4 rounded-full"
          onClick={onRemove}
          aria-label={`Remove ${team.name}`}
        >
          <X className="h-3 w-3" />
        </Button>
      )}
    </div>
  )
}
