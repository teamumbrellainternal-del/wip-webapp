import { ChevronDown, ChevronRight, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"

interface Environment {
  id: string
  name: string
  type: "production" | "preview" | "development"
}

interface EnvironmentBreadcrumbProps {
  environments: Environment[]
  currentEnvironment: Environment
  onEnvironmentChange: (environment: Environment) => void
  onSettingsClick: () => void
}

export function EnvironmentBreadcrumb({
  environments,
  currentEnvironment,
  onEnvironmentChange,
  onSettingsClick,
}: EnvironmentBreadcrumbProps) {
  const getBadgeVariant = (type: Environment["type"]) => {
    switch (type) {
      case "production":
        return "default"
      case "preview":
        return "secondary"
      case "development":
        return "outline"
    }
  }

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-1 text-lg font-semibold">
        <span>Environments</span>
        <ChevronRight className="h-4 w-4 text-muted-foreground" />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-auto p-0 font-semibold">
              <span>{currentEnvironment.name}</span>
              <Badge variant={getBadgeVariant(currentEnvironment.type)} className="ml-2">
                {currentEnvironment.type}
              </Badge>
              <ChevronDown className="ml-1 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {environments.map((env) => (
              <DropdownMenuItem key={env.id} onClick={() => onEnvironmentChange(env)}>
                <div className="flex items-center gap-2">
                  <span>{env.name}</span>
                  <Badge variant={getBadgeVariant(env.type)} className="ml-2">
                    {env.type}
                  </Badge>
                </div>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <Button variant="outline" size="sm" onClick={onSettingsClick}>
        <Settings className="mr-2 h-4 w-4" />
        Settings
      </Button>
    </div>
  )
}
