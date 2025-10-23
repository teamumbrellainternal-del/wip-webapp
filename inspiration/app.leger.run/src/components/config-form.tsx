import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { ChevronDown } from 'lucide-react'
import { saveConfigData } from '@/utils/storage'
import type { ConfigData } from '@/types'

// Import schema and component utilities - DISABLED (legacy files removed)
// import { categories, getFieldsInCategory, fieldConfigurations } from '@/schemas/generated-uiSchema'
// import { getComponentForField, getComponentProps } from '@/schemas/generated-component-mapping'

// Temporary fallback functions to keep legacy form working
const categories: any[] = [];
const getFieldsInCategory = (_category: string) => [];
const fieldConfigurations: any = {};
const getComponentForField = (_fieldName: string) => 'text-field';

// Import all available field components
import { TextField } from '@/components/ui/form/fields/text-field'
import { ToggleField } from '@/components/ui/form/fields/toggle-field'
import { SecretField } from '@/components/ui/form/fields/secret-field'
import { SelectField } from '@/components/ui/form/fields/select-field'
import { URLInput } from '@/components/ui/form/fields/url-input'
import { Textarea } from '@/components/ui/textarea'

interface ConfigFormProps {
  data: ConfigData
  onDataChange: (data: ConfigData) => void
  className?: string
}

export function ConfigForm({ data, onDataChange, className }: ConfigFormProps) {
  const handleFieldChange = (key: string, value: string | boolean | number) => {
    const newData = {
      ...data,
      [key]: typeof value === 'boolean' ? (value ? 'true' : 'false') : String(value)
    }
    onDataChange(newData)
    saveConfigData(newData)
  }
  
  const getFieldValue = (key: string, fieldType: string, defaultValue: any = ''): any => {
    const value = data[key]
    
    if (value === undefined || value === null) {
      return defaultValue
    }
    
    // Handle boolean fields
    if (fieldType === 'boolean') {
      if (value === 'true' || value === '1') return true
      if (value === 'false' || value === '0') return false
      return defaultValue
    }
    
    // Handle numeric fields
    if (fieldType === 'number' || fieldType === 'integer') {
      const num = Number(value)
      return isNaN(num) ? defaultValue : num
    }
    
    // Handle array fields
    if (fieldType === 'array') {
      try {
        return Array.isArray(value) ? value : JSON.parse(value || '[]')
      } catch {
        return []
      }
    }
    
    return String(value)
  }

  const renderField = (fieldName: string, fieldConfig: any) => {
    const componentType = getComponentForField(fieldName)
    const fieldType = fieldConfig.type || 'string'
    const title = fieldConfig['ui:title'] || fieldName
    const description = fieldConfig['ui:description']
    
    // Map component types to actual components
    switch (componentType) {
      case 'toggle-field':
        return (
          <ToggleField
            key={fieldName}
            label={title}
            description={description}
            checked={getFieldValue(fieldName, fieldType, false)}
            onCheckedChange={(checked) => handleFieldChange(fieldName, checked)}
          />
        )
      
      case 'secret-field':
        return (
          <SecretField
            key={fieldName}
            label={title}
            description={description}
            value={getFieldValue(fieldName, fieldType, '')}
            onChange={(e) => handleFieldChange(fieldName, e.target.value)}
          />
        )
      
      case 'url-input':
        return (
          <URLInput
            key={fieldName}
            label={title}
            description={description}
            value={getFieldValue(fieldName, fieldType, '')}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleFieldChange(fieldName, e.target.value)}
          />
        )
      
      case 'select-field': {
        const options = fieldConfig['ui:options']?.enumOptions || []
        return (
          <SelectField
            key={fieldName}
            label={title}
            description={description}
            value={getFieldValue(fieldName, fieldType, '')}
            onChange={(value: string) => handleFieldChange(fieldName, value)}
            options={options}
          />
        )
      }
      
      case 'markdown-text-area':
        return (
          <div key={fieldName} className="space-y-2">
            <label className="text-sm font-medium">{title}</label>
            {description && <p className="text-sm text-muted-foreground">{description}</p>}
            <Textarea
              value={getFieldValue(fieldName, fieldType, '')}
              onChange={(e) => handleFieldChange(fieldName, e.target.value)}
              className="min-h-[80px]"
            />
          </div>
        )
      
      case 'text-field':
      default:
        return (
          <TextField
            key={fieldName}
            label={title}
            description={description}
            value={getFieldValue(fieldName, fieldType, '')}
            onChange={(e) => handleFieldChange(fieldName, e.target.value)}
          />
        )
    }
  }

  return (
    <div className={className}>
      <div className="space-y-6">
        {categories.map((category) => {
          const categoryFields = getFieldsInCategory(category.name)
          
          return (
            <Collapsible key={category.name} defaultOpen={category.order <= 5}>
              <Card>
                <CollapsibleTrigger className="w-full">
                  <CardHeader className="hover:bg-muted/50 transition-colors">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg text-left">
                        {category.displayName}
                      </CardTitle>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">
                          {categoryFields.length} fields
                        </span>
                        <ChevronDown className="h-4 w-4 transition-transform duration-200 data-[state=open]:rotate-180" />
                      </div>
                    </div>
                    {category.description && (
                      <p className="text-sm text-muted-foreground text-left">
                        {category.description}
                      </p>
                    )}
                  </CardHeader>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <CardContent className="space-y-4">
                    {categoryFields.map((fieldName) => {
                      const fieldConfig = fieldConfigurations[fieldName]
                      if (!fieldConfig) return null
                      
                      return renderField(fieldName, fieldConfig)
                    })}
                  </CardContent>
                </CollapsibleContent>
              </Card>
            </Collapsible>
          )
        })}
      </div>
    </div>
  )
}
