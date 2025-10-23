import type React from "react"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Plus, X } from "lucide-react"
import { Label } from "@/components/ui/label"
import { FormDescription } from "@/components/ui/form"

interface PathManagementListProps {
  paths: string[]
  onChange: (paths: string[]) => void
  placeholder?: string
  label?: string
  description?: string
  pathPrefix?: string
}

export function PathManagementList({
  paths,
  onChange,
  placeholder = "/api/route",
  label = "Paths",
  description,
  pathPrefix,
}: PathManagementListProps) {
  const [newPath, setNewPath] = useState("")

  const handleAddPath = () => {
    if (newPath.trim()) {
      onChange([...paths, newPath.trim()])
      setNewPath("")
    }
  }

  const handleRemovePath = (index: number) => {
    const newPaths = [...paths]
    newPaths.splice(index, 1)
    onChange(newPaths)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault()
      handleAddPath()
    }
  }

  return (
    <div className="space-y-2">
      {label && <Label>{label}</Label>}
      {description && <FormDescription>{description}</FormDescription>}

      <div className="space-y-2">
        {paths.map((path, index) => (
          <div key={index} className="flex items-center gap-2">
            <div className="relative flex-1">
              {pathPrefix && (
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <span className="text-sm text-muted-foreground">{pathPrefix}</span>
                </div>
              )}
              <Input value={path} readOnly className={pathPrefix ? "pl-12" : ""} />
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => handleRemovePath(index)}
              aria-label={`Remove ${path}`}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ))}

        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            {pathPrefix && (
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <span className="text-sm text-muted-foreground">{pathPrefix}</span>
              </div>
            )}
            <Input
              value={newPath}
              onChange={(e) => setNewPath(e.target.value)}
              placeholder={placeholder}
              onKeyDown={handleKeyDown}
              className={pathPrefix ? "pl-12" : ""}
            />
          </div>
          <Button type="button" variant="outline" size="icon" onClick={handleAddPath} disabled={!newPath.trim()}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
