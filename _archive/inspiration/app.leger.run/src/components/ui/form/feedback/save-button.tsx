import { Button, type ButtonProps } from "@/components/ui/button"
import { Loader2 } from "lucide-react"

interface SaveButtonProps extends ButtonProps {
  isDirty?: boolean
  isLoading?: boolean
  saveText?: string
}

export function SaveButton({ isDirty = false, isLoading = false, saveText = "Save", ...props }: SaveButtonProps) {
  return (
    <Button disabled={!isDirty || isLoading || props.disabled} {...props}>
      {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {saveText}
    </Button>
  )
}
