import { useToast } from "@/hooks/use-toast"
import { ToastAction } from "@/components/ui/toast"

interface ValidationError {
  field: string
  message: string
}

interface ToastErrorProps {
  title?: string
  errors: ValidationError[]
  onDismiss?: () => void
}

export function ShowValidationErrors({ title = "Validation Error", errors, onDismiss }: ToastErrorProps) {
  const { toast } = useToast()

  toast({
    variant: "destructive",
    title: title,
    description: (
      <div className="mt-2">
        {errors.length === 1 ? (
          <p>{errors[0].message}</p>
        ) : (
          <ul className="list-disc pl-4 space-y-1">
            {errors.map((error, index) => (
              <li key={index}>{error.message}</li>
            ))}
          </ul>
        )}
      </div>
    ),
    action: onDismiss ? (
      <ToastAction altText="Dismiss" onClick={onDismiss}>
        Dismiss
      </ToastAction>
    ) : undefined,
    duration: 10000, // 10 seconds
  })
}
