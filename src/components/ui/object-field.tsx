import React from "react"
import { Plus, X, ChevronDown, ChevronRight } from "lucide-react"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FormDescription } from "@/components/ui/form"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"

interface ObjectFieldProps {
  label: string
  description?: string
  error?: string
  value?: Record<string, any>
  onChange?: (value: Record<string, any> | undefined) => void
  disabled?: boolean
  _id?: string
  allowedTypes?: string[]
  maxDepth?: number
  currentDepth?: number
}

type PropertyType = "string" | "number" | "boolean" | "object" | "array"

export function ObjectField({
  label,
  description,
  error,
  value = {},
  onChange,
  disabled = false,
  _id,
  allowedTypes = ["string", "number", "boolean", "object"],
  maxDepth = 3,
  currentDepth = 0,
}: ObjectFieldProps) {
  const [isOpen, setIsOpen] = React.useState(true)
  const [newPropertyName, setNewPropertyName] = React.useState("")
  const [newPropertyType, setNewPropertyType] = React.useState<PropertyType>("string")

  const handleAddProperty = () => {
    if (!newPropertyName.trim()) return
    
    let defaultValue: any
    switch (newPropertyType) {
      case "string":
        defaultValue = ""
        break
      case "number":
        defaultValue = 0
        break
      case "boolean":
        defaultValue = false
        break
      case "object":
        defaultValue = {}
        break
      case "array":
        defaultValue = []
        break
      default:
        defaultValue = ""
    }

    const newObject = { ...value, [newPropertyName]: defaultValue }
    onChange?.(newObject)
    setNewPropertyName("")
  }

  const handleRemoveProperty = (key: string) => {
    const newObject = { ...value }
    delete newObject[key]
    onChange?.(Object.keys(newObject).length > 0 ? newObject : undefined)
  }

  const handlePropertyValueChange = (key: string, newValue: any) => {
    const newObject = { ...value, [key]: newValue }
    onChange?.(newObject)
  }

  const renderPropertyValue = (key: string, propertyValue: any) => {
    const propertyType = Array.isArray(propertyValue) ? "array" : typeof propertyValue
    
    switch (propertyType) {
      case "string":
        return (
          <Input
            value={propertyValue}
            onChange={(e) => handlePropertyValueChange(key, e.target.value)}
            placeholder="Enter string value"
            disabled={disabled}
          />
        )
      
      case "number":
        return (
          <Input
            type="number"
            value={propertyValue}
            onChange={(e) => {
              const numValue = parseFloat(e.target.value)
              handlePropertyValueChange(key, isNaN(numValue) ? 0 : numValue)
            }}
            placeholder="Enter number"
            disabled={disabled}
          />
        )
      
      case "boolean":
        return (
          <Select
            value={propertyValue.toString()}
            onValueChange={(value) => handlePropertyValueChange(key, value === "true")}
            disabled={disabled}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="true">True</SelectItem>
              <SelectItem value="false">False</SelectItem>
            </SelectContent>
          </Select>
        )
      
      case "object":
        if (currentDepth >= maxDepth) {
          return (
            <div className="text-sm text-muted-foreground p-2 border rounded">
              Max nesting depth reached. Edit as JSON if needed.
            </div>
          )
        }
        return (
          <ObjectField
            label={`${key} (object)`}
            value={propertyValue}
            onChange={(newValue) => handlePropertyValueChange(key, newValue)}
            disabled={disabled}
            allowedTypes={allowedTypes}
            maxDepth={maxDepth}
            currentDepth={currentDepth + 1}
          />
        )
      
      case "array":
        return (
          <div className="space-y-2">
            <div className="text-sm text-muted-foreground">Array (simplified JSON edit):</div>
            <Input
              value={JSON.stringify(propertyValue)}
              onChange={(e) => {
                try {
                  const parsed = JSON.parse(e.target.value)
                  if (Array.isArray(parsed)) {
                    handlePropertyValueChange(key, parsed)
                  }
                } catch {
                  // Invalid JSON, keep current value
                }
              }}
              placeholder="[]"
              disabled={disabled}
            />
          </div>
        )
      
      default:
        return (
          <Input
            value={String(propertyValue)}
            onChange={(e) => handlePropertyValueChange(key, e.target.value)}
            disabled={disabled}
          />
        )
    }
  }

  return (
    <div className="space-y-2">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <div className="flex items-center justify-between">
          <Label className={error ? "text-destructive" : ""}>
            {label}
          </Label>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm">
              {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </Button>
          </CollapsibleTrigger>
        </div>
        
        <CollapsibleContent className="space-y-4">
          {/* Object Properties */}
          <div className="space-y-3 border rounded-lg p-4">
            {Object.entries(value).map(([key, propertyValue]) => (
              <div key={key} className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">{key}</Label>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveProperty(key)}
                    disabled={disabled}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                {renderPropertyValue(key, propertyValue)}
              </div>
            ))}
            
            {/* Add new property */}
            {!disabled && (
              <div className="pt-2 border-t space-y-2">
                <div className="flex gap-2">
                  <Input
                    placeholder="Property name"
                    value={newPropertyName}
                    onChange={(e) => setNewPropertyName(e.target.value)}
                    className="flex-1"
                  />
                  <Select value={newPropertyType} onValueChange={(value: PropertyType) => setNewPropertyType(value)}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {allowedTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    onClick={handleAddProperty}
                    disabled={!newPropertyName.trim()}
                    size="sm"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </CollapsibleContent>
      </Collapsible>
      
      {description && !error && <FormDescription>{description}</FormDescription>}
      {error && <p className="text-sm font-medium text-destructive">{error}</p>}
    </div>
  )
}