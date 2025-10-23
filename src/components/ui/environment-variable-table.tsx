import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { MoreHorizontal, Eye, EyeOff, Edit, Trash } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"

export interface EnvironmentVariable {
  id: string
  key: string
  value: string
  isSensitive: boolean
  environments: string[]
  updatedAt: string
}

interface EnvironmentVariableTableProps {
  variables: EnvironmentVariable[]
  onEdit: (variable: EnvironmentVariable) => void
  onDelete: (variable: EnvironmentVariable) => void
  onDetach?: (variable: EnvironmentVariable) => void
}

export function EnvironmentVariableTable({ variables, onEdit, onDelete, onDetach }: EnvironmentVariableTableProps) {
  const [showValues, setShowValues] = useState<Record<string, boolean>>({})

  const toggleValueVisibility = (id: string) => {
    setShowValues((prev) => ({
      ...prev,
      [id]: !prev[id],
    }))
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[30%]">Name</TableHead>
            <TableHead className="w-[40%]">Value</TableHead>
            <TableHead className="w-[20%]">Environment</TableHead>
            <TableHead className="w-[10%] text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {variables.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="h-24 text-center">
                No environment variables found.
              </TableCell>
            </TableRow>
          ) : (
            variables.map((variable) => (
              <TableRow key={variable.id}>
                <TableCell className="font-mono text-sm">{variable.key}</TableCell>
                <TableCell>
                  {variable.isSensitive ? (
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-sm">
                        {showValues[variable.id] ? variable.value : "••••••••••••••••"}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => toggleValueVisibility(variable.id)}
                        className="h-6 w-6"
                      >
                        {showValues[variable.id] ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                      </Button>
                    </div>
                  ) : (
                    <span className="font-mono text-sm">{variable.value}</span>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {variable.environments.map((env) => (
                      <Badge key={env} variant="outline" className="text-xs">
                        {env}
                      </Badge>
                    ))}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Open menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onEdit(variable)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      {onDetach && (
                        <DropdownMenuItem onClick={() => onDetach(variable)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Detach
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => onDelete(variable)}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash className="mr-2 h-4 w-4" />
                        Remove
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}
