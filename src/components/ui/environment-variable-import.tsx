import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FormDescription } from "@/components/ui/form"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { FileUp, Info } from "lucide-react"

interface EnvironmentVariableImportProps {
  onImport: (variables: Array<{ key: string; value: string }>, environment: string) => void
  onCancel: () => void
}

export function EnvironmentVariableImport({ onImport, onCancel }: EnvironmentVariableImportProps) {
  const [pasteContent, setPasteContent] = useState("")
  const [environment, setEnvironment] = useState("all")
  const [parsedVariables, setParsedVariables] = useState<Array<{ key: string; value: string }>>([])
  const [parseError, setParseError] = useState<string | null>(null)

  const parseEnvFile = (content: string) => {
    try {
      setParseError(null)
      const lines = content.split("\n").filter((line) => line.trim() !== "" && !line.startsWith("#"))
      const variables = lines.map((line) => {
        const [key, ...valueParts] = line.split("=")
        const value = valueParts.join("=")
        return {
          key: key.trim(),
          value: value.trim().replace(/^['"](.*)['"]$/, "$1"), // Remove quotes if present
        }
      })
      setParsedVariables(variables)
      return variables.length > 0
    } catch (error) {
      setParseError("Failed to parse .env file. Please check the format.")
      setParsedVariables([])
      return false
    }
  }

  const handlePasteChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const content = e.target.value
    setPasteContent(content)
    if (content.trim()) {
      parseEnvFile(content)
    } else {
      setParsedVariables([])
    }
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const content = event.target?.result as string
      setPasteContent(content)
      parseEnvFile(content)
    }
    reader.readAsText(file)
  }

  const handleImport = () => {
    if (parsedVariables.length > 0) {
      onImport(parsedVariables, environment)
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Import Environment Variables</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Tabs defaultValue="paste">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="paste">Paste .env</TabsTrigger>
            <TabsTrigger value="upload">Upload File</TabsTrigger>
          </TabsList>
          <TabsContent value="paste" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="env-content">Paste .env file content</Label>
              <Textarea
                id="env-content"
                placeholder="KEY=value"
                className="font-mono text-sm min-h-[200px]"
                value={pasteContent}
                onChange={handlePasteChange}
              />
            </div>
          </TabsContent>
          <TabsContent value="upload" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="env-file">Upload .env file</Label>
              <div className="border-2 border-dashed rounded-md p-6 text-center">
                <FileUp className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground mb-2">
                  Drag and drop your .env file here, or click to browse
                </p>
                <Input id="env-file" type="file" accept=".env,.txt" className="hidden" onChange={handleFileUpload} />
                <Button type="button" variant="outline" onClick={() => document.getElementById("env-file")?.click()}>
                  Select File
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {parseError && (
          <Alert variant="destructive">
            <AlertDescription>{parseError}</AlertDescription>
          </Alert>
        )}

        {parsedVariables.length > 0 && (
          <div className="space-y-2">
            <Label>Preview ({parsedVariables.length} variables)</Label>
            <div className="max-h-[200px] overflow-y-auto rounded-md border p-2">
              {parsedVariables.map((variable, index) => (
                <div key={index} className="flex py-1 text-sm font-mono">
                  <span className="font-semibold">{variable.key}</span>
                  <span className="mx-1">=</span>
                  <span className="text-muted-foreground truncate">{variable.value}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="environment">Target Environment</Label>
          <Select value={environment} onValueChange={setEnvironment}>
            <SelectTrigger id="environment">
              <SelectValue placeholder="Select environment" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Environments</SelectItem>
              <SelectItem value="production">Production</SelectItem>
              <SelectItem value="preview">Preview</SelectItem>
              <SelectItem value="development">Development</SelectItem>
            </SelectContent>
          </Select>
          <FormDescription>Variables will be added to the selected environment.</FormDescription>
        </div>

        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            Importing variables will not overwrite existing variables with the same name.
          </AlertDescription>
        </Alert>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={handleImport} disabled={parsedVariables.length === 0}>
          Import {parsedVariables.length} Variables
        </Button>
      </CardFooter>
    </Card>
  )
}
