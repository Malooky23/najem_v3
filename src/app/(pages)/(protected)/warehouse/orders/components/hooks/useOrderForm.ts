import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "@/hooks/use-toast"
import { EnrichedOrders, updateOrderSchema } from "@/types/orders"
import { ReactNode } from "react"

interface UseOrderFormProps {
  order: EnrichedOrders
  onSave?: (updatedOrder: EnrichedOrders) => Promise<void>
}

interface FormState {
  form: ReturnType<typeof useForm<EnrichedOrders>>
  isEditing: boolean
  isSaving: boolean
  handleSave: () => Promise<void>
  handleEdit: () => void
  handleCancel: () => void
}

export function useOrderForm({ order, onSave }: UseOrderFormProps): FormState {
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const form = useForm<EnrichedOrders>({
    resolver: zodResolver(updateOrderSchema),
    defaultValues: order,
    mode: "onChange"
  })

  // Update form values when order changes
  useEffect(() => {
    if (!isEditing) {
      // Only update if not in edit mode to prevent losing unsaved changes
      form.reset(order)
    }
  }, [order, form, isEditing])

  const handleSave = async () => {
    try {
      if (!onSave) {
        throw new Error('Cannot save: save callback is not provided')
      }

      const values = form.getValues()
      const validationResult = updateOrderSchema.safeParse(values)

      if (!validationResult.success) {
        const errors = validationResult.error.issues.map(issue =>
          `${issue.path.join('.')}: ${issue.message}`
        )
        console.error('Validation errors:', errors)
        toast({
          title: "Please fix the following errors:",
          description: errors.join('\n'),
          variant: "destructive",
        })
        return
      }

      // Check if any values have changed
      const hasChanges = Object.entries(values).some(([key, value]) => {
        if (typeof value === 'function' || value === null) return false
        return JSON.stringify(value) !== JSON.stringify(order[key as keyof typeof order])
      })

      if (!hasChanges) {
        toast({
          description: "No changes to save",
          variant: "default",
        })
        setIsEditing(false)
        return
      }

      // Store original values for rollback
      const originalValues = form.getValues()

      try {
        setIsSaving(true)
        await onSave(values)

        const changedFields = Object.entries(values)
          .filter(([key, value]) => value !== originalValues[key as keyof typeof originalValues])
          .map(([key, value]) => `${key}: ${value}`)
          .join(', ')

        toast({
          title: "Order updated successfully",
          description: changedFields,
          variant: "default",
        })

        setIsEditing(false)
      } catch (error) {
        // Revert form values on error
        form.reset(originalValues)

        const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred'
        console.error('Save operation failed:', error)
        toast({
          title: "Failed to update order",
          description: errorMessage,
          variant: "destructive",
        })

        throw error // Re-throw to trigger SaveButton error state
      }
    } catch (error) {
      throw error // Re-throw to trigger SaveButton error state
    } finally {
      setIsSaving(false)
    }
  }

  const handleEdit = () => {
    if (order.status === "COMPLETED") {
      const confirmChange = window.confirm("Cannot modify COMPLETED order. Would you like to change status to DRAFT?")
      if (confirmChange) {
        form.setValue("status", "DRAFT")
        // Save the status change immediately before allowing edits
        handleSave().then(() => {
          setIsEditing(true)
        }).catch(() => {
          // If save fails, revert the status change
          form.setValue("status", "COMPLETED")
          toast({
            title: "Failed to change status",
            description: "Could not change order status to DRAFT",
            variant: "destructive",
          })
        })
      }
      return
    }
    setIsEditing(true)
    form.reset(order) // Reset form with current order data when entering edit mode
  }

  const handleCancel = () => {
    setIsEditing(false)
    form.reset(order)
  }

  return {
    form,
    isEditing,
    isSaving,
    handleSave,
    handleEdit,
    handleCancel
  }
}