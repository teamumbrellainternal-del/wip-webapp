import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Eye, EyeOff, X } from "lucide-react"
import { FormDescription } from "@/components/ui/form"
import { ConditionalField } from "../form/wrappers/conditional-field"

interface EnvironmentVariableFormProps {
  isEditing?: boolean
  initialData?: {
    key: string
    value: string
    isSensitive: boolean
    environment: string
    note?: string
  }
  onSubmit: (data: {
    key: string
    value: string
    isSensitive: boolean
    environment: string
    note?: string
  }) => void
  onCancel: () => void
}

export function EnvironmentVariableForm({
  isEditing = false,
  initialData = {
    key: "",
    value: "",
    isSensitive: false,
    environment: "all",
    note: "",
  },
  onSubmit,
  onCancel,
}: EnvironmentVariableFormProps) {
  const [formData, setFormData] = useState(initialData)
  const [showValue, setShowValue] = useState(!initialData.isSensitive)
  const [showNoteField, setShowNoteField] = useState(!!initialData.note)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSwitchChange = (name: string, checked: boolean) => {
    setFormData((prev) => ({ ...prev, [name]: checked }))
    if (name === "isSensitive" && checked) {
      setShowValue(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{isEditing ? "Edit Environment Variable" : "Add Environment Variable"}</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="key">Name</Label>
            <Input
              id="key"
              name="key"
              placeholder="DATABASE_URL"
              value={formData.key}
              onChange={handleChange}
              readOnly={isEditing}
              className={isEditing ? "bg-muted" : ""}
            />
            <FormDescription>
              Environment variable names must start with a letter and can only contain letters, numbers, and
              underscores.
            </FormDescription>
          </div>

          <div className="space-y-2">
            <Label htmlFor="value">Value</Label>
            <div className="relative">
              <Input
                id="value"
                name="value"
                type={showValue ? "text" : "password"}
                placeholder="Enter value"
                value={formData.value}
                onChange={handleChange}
              />
              {formData.isSensitive && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowValue(!showValue)}
                >
                  {showValue ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="isSensitive"
              checked={formData.isSensitive}
              onCheckedChange={(checked) => handleSwitchChange("isSensitive", checked)}
            />
            <Label htmlFor="isSensitive">Sensitive</Label>
          </div>
          <FormDescription>Sensitive values are encrypted and cannot be viewed after creation.</FormDescription>

          <div className="space-y-2">
            <Label htmlFor="environment">Environment</Label>
            <Select
              name="environment"
              value={formData.environment}
              onValueChange={(value) => setFormData((prev) => ({ ...prev, environment: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select environment" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Environments</SelectItem>
                <SelectItem value="production">Production</SelectItem>
                <SelectItem value="preview">Preview</SelectItem>
                <SelectItem value="development">Development</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <ConditionalField show={formData.environment === "preview"}>
            <div className="space-y-2 pt-2">
              <Label htmlFor="branch">Branch</Label>
              <Select
                name="branch"
                defaultValue="all"
                onValueChange={(value) => setFormData((prev) => ({ ...prev, branch: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select branch" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Preview Branches</SelectItem>
                  <SelectItem value="main">main</SelectItem>
                  <SelectItem value="develop">develop</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </ConditionalField>

          {!showNoteField ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowNoteField(true)}
              className="text-xs"
            >
              Add Note
            </Button>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="note">Note</Label>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setShowNoteField(false)
                    setFormData((prev) => ({ ...prev, note: "" }))
                  }}
                  className="h-6 w-6"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <Textarea
                id="note"
                name="note"
                placeholder="Add a note about this variable"
                value={formData.note || ""}
                onChange={handleChange}
                className="min-h-[80px]"
              />
              <FormDescription>
                Notes are only visible to your team and help document the purpose of this variable.
              </FormDescription>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">{isEditing ? "Update" : "Create"}</Button>
        </CardFooter>
      </form>
    </Card>
  )
}
