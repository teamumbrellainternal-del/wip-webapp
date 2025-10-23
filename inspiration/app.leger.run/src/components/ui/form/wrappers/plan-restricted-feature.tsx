import type React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { LockIcon } from "lucide-react"

interface PlanRestrictedFeatureProps {
  title: string
  _description: string
  requiredPlan: string
  callToAction: string
  onUpgradeClick: () => void
  children: React.ReactNode
}

export function PlanRestrictedFeature({
  title,
  _description,
  requiredPlan,
  callToAction,
  onUpgradeClick,
  children,
}: PlanRestrictedFeatureProps) {
  return (
    <Card className="relative border-dashed opacity-75">
      <div className="absolute inset-0 bg-background/50 backdrop-blur-[1px] z-10 pointer-events-none" />

      <CardHeader>
        <div className="flex items-center gap-2">
          <LockIcon className="h-4 w-4 text-muted-foreground" />
          <CardTitle>{title}</CardTitle>
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-4">{children}</div>
      </CardContent>

      <CardFooter className="border-t bg-muted/50 z-20 relative flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">
          Available on the <strong>{requiredPlan}</strong> plan or higher
        </p>
        <Button onClick={onUpgradeClick}>{callToAction}</Button>
      </CardFooter>
    </Card>
  )
}
