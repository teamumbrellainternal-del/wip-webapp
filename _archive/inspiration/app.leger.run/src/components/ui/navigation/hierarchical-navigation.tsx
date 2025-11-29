import { useState } from "react"
import { cn } from "@/lib/utils"
import { ChevronDown, ChevronRight, CheckCircle, AlertCircle, Circle } from "lucide-react"

interface NavigationItem {
  id: string
  label: string
  status?: "complete" | "error" | "incomplete"
  children?: NavigationItem[]
}

interface HierarchicalNavigationProps {
  items: NavigationItem[]
  activeItemId: string
  onItemClick: (itemId: string) => void
  className?: string
}

export function HierarchicalNavigation({ items, activeItemId, onItemClick, className }: HierarchicalNavigationProps) {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>(() => {
    // Initialize with all parent sections of the active item expanded
    const expanded: Record<string, boolean> = {}

    const expandParents = (items: NavigationItem[], targetId: string): boolean => {
      for (const item of items) {
        if (item.id === targetId) return true

        if (item.children) {
          const foundInChildren = expandParents(item.children, targetId)
          if (foundInChildren) {
            expanded[item.id] = true
            return true
          }
        }
      }
      return false
    }

    expandParents(items, activeItemId)
    return expanded
  })

  const toggleSection = (itemId: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [itemId]: !prev[itemId],
    }))
  }

  const renderStatusIcon = (status?: NavigationItem["status"]) => {
    switch (status) {
      case "complete":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "error":
        return <AlertCircle className="h-4 w-4 text-destructive" />
      case "incomplete":
        return <Circle className="h-4 w-4 text-muted-foreground" />
      default:
        return null
    }
  }

  const renderItem = (item: NavigationItem, depth = 0) => {
    const hasChildren = item.children && item.children.length > 0
    const isExpanded = !!expandedSections[item.id]
    const isActive = item.id === activeItemId

    return (
      <li key={item.id}>
        <div
          className={cn(
            "flex items-center py-1.5 px-3 rounded-md text-sm",
            isActive ? "bg-muted font-medium" : "hover:bg-muted/50 cursor-pointer",
            depth > 0 && "ml-4",
          )}
          onClick={() => {
            if (hasChildren) {
              toggleSection(item.id)
            }
            onItemClick(item.id)
          }}
        >
          {hasChildren && (
            <button
              type="button"
              className="mr-1 p-0.5 rounded-sm hover:bg-muted-foreground/10"
              onClick={(e) => {
                e.stopPropagation()
                toggleSection(item.id)
              }}
            >
              {isExpanded ? (
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              ) : (
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              )}
            </button>
          )}
          <span className="flex-1">{item.label}</span>
          {renderStatusIcon(item.status)}
        </div>

        {hasChildren && isExpanded && item.children && (
          <ul className="mt-1">{item.children.map((child) => renderItem(child, depth + 1))}</ul>
        )}
      </li>
    )
  }

  return (
    <nav className={cn("w-full", className)}>
      <ul className="space-y-1">{items.map((item) => renderItem(item))}</ul>
    </nav>
  )
}
