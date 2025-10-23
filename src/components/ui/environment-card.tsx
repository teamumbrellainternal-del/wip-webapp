import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MoreHorizontal, ExternalLink } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface EnvironmentCardProps {
  name: string
  type: "production" | "preview" | "development"
  domain?: string
  branchName?: string
  variableCount: number
  lastDeployed?: string
  onSettings: () => void
  onViewDeployments: () => void
  onVisit?: () => void
}

export function EnvironmentCard({
  name,
  type,
  domain,
  branchName,
  variableCount,
  lastDeployed,
  onSettings,
  onViewDeployments,
  onVisit,
}: EnvironmentCardProps) {
  const getBadgeVariant = () => {
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
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div>
            <Badge variant={getBadgeVariant()} className="mb-2">
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </Badge>
            <CardTitle>{name}</CardTitle>
            {domain && <CardDescription className="mt-1">{domain}</CardDescription>}
            {branchName && (
              <div className="mt-1 text-sm text-muted-foreground">
                Branch: <span className="font-medium">{branchName}</span>
              </div>
            )}
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="h-4 w-4" />
                <span className="sr-only">Open menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onSettings}>Settings</DropdownMenuItem>
              <DropdownMenuItem onClick={onViewDeployments}>View Deployments</DropdownMenuItem>
              {onVisit && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={onVisit}>
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Visit
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-sm">
          <div className="flex justify-between py-1">
            <span className="text-muted-foreground">Environment Variables</span>
            <span>{variableCount}</span>
          </div>
          {lastDeployed && (
            <div className="flex justify-between py-1">
              <span className="text-muted-foreground">Last Deployed</span>
              <span>{lastDeployed}</span>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter>
        <Button variant="outline" size="sm" className="w-full" onClick={onSettings}>
          Manage Environment
        </Button>
      </CardFooter>
    </Card>
  )
}
