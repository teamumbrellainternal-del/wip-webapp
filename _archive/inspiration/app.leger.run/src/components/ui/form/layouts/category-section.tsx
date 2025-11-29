import type React from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"

interface CategorySectionProps {
  title: string
  description?: string
  children: React.ReactNode
  footer?: React.ReactNode
  isDirty?: boolean
  isLoading?: boolean
  onSave?: () => void
  saveText?: string
  documentationLink?: {
    text: string
    href: string
  }
}

export function CategorySection({
  title,
  description,
  children,
  footer,
  isDirty = false,
  isLoading = false,
  onSave,
  saveText = "Save",
  documentationLink,
}: CategorySectionProps) {
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>

      <CardContent>
        <div className="space-y-6">{children}</div>
      </CardContent>

      <CardFooter className="flex flex-col space-y-2 sm:flex-row sm:justify-between sm:space-y-0">
        <div className="text-sm text-muted-foreground">
          {documentationLink && (
            <a
              href={documentationLink.href}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
            >
              {documentationLink.text}
            </a>
          )}
        </div>

        {onSave && (
          <Button onClick={onSave} disabled={!isDirty || isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {saveText}
          </Button>
        )}

        {footer}
      </CardFooter>
    </Card>
  )
}
