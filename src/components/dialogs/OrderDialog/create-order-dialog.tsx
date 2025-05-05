"use client"

import { useState, memo, useCallback, type ReactNode } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogContentNoXButton, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { DialogTrigger } from "@radix-ui/react-dialog"
import { PlusIcon, PencilIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import OrderForm from "./OrderForm"
import type { CreateOrderInput } from "@/types/orders"

interface CreateOrderDialogProps {
  isMobile?: boolean
  initialData?: CreateOrderInput & { orderId?: string; orderNumber?: number }
  isEditMode?: boolean
  triggerLabel?: string
  children?: ReactNode
}

// Create a memoized dialog trigger button
const CreateOrderButton = memo(
  ({
    onClick,
    isMobile,
    isEditMode = false,
    triggerLabel,
  }: {
    onClick: () => void
    isMobile?: boolean
    isEditMode?: boolean
    triggerLabel?: string
  }) => (
    <Button
      variant="outline"
      onClick={onClick}
      size={isMobile ? "sm" : "default"}
      className={cn(
        "transition-all flex items-center gap-2",
        isEditMode
          ? "bg-amber-50 text-amber-700 hover:bg-amber-100"
          : isMobile
            ? "bg-blue-500 text-white hover:bg-blue-600"
            : "bg-blue-50 text-blue-700 hover:bg-blue-100",
      )}
    >
      {isEditMode ? <PencilIcon size={16} /> : <PlusIcon size={16} />}
      {!isMobile && <span>{triggerLabel || (isEditMode ? "Edit" : "New Order")}</span>}
    </Button>
  ),
)

CreateOrderButton.displayName = "CreateOrderButton"

function CreateOrderDialogComponent({
  isMobile = false,
  initialData,
  isEditMode = false,
  triggerLabel,
  children,
}: CreateOrderDialogProps) {
  const [ isOpen, setIsOpen ] = useState(false)
  // Use a key to force re-render of form component when dialog reopens
  const [ formKey, setFormKey ] = useState(0)

  const handleOpenChange = useCallback((open: boolean) => {
    if (open) {
      // Generate a new key every time the dialog opens
      setFormKey((prev) => prev + 1)
    }
    setIsOpen(open)
  }, [])

  const handleButtonClick = useCallback(() => {
    setFormKey((prev) => prev + 1)
    setIsOpen(true)
  }, [])

  const handleFormClose = useCallback(() => {
    setIsOpen(false)
  }, [])

  return (
    <Dialog  open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {children ? (
          // If children is provided, use it as the trigger
          <div onClick={handleButtonClick}>{children}</div>
        ) : (
          // Otherwise use the default button
          <CreateOrderButton
            onClick={handleButtonClick}
            isMobile={isMobile}
            isEditMode={isEditMode}
            triggerLabel={triggerLabel}
          />
        )}
      </DialogTrigger>

      <DialogContentNoXButton  className="max-w-full sm:max-w-[95%] md:max-w-[90%] lg:max-w-[80%] xl:max-w-[1100px] h-full sm:h-[85vh] p-0 overflow-hidden flex-row">
        <DialogHeader className="px-6 border-b h-auto  bg-slate-50">
          <DialogTitle className="text-xl py-2 text-left font-semibold ">
           <span className=""> {isEditMode
              ? `Edit Order ${initialData?.orderId ? `#${initialData.orderNumber}` : ""}`
              : "Create New Order"}</span>
          </DialogTitle>
        </DialogHeader>
        <div className="flex-1 -mt-4 md:pt-2  h-full overflow-hidden bg-slate-100">
        {/* <div className="flex-1 pt-0  bg-green-200 h-full overflow-hidden"> */}
          {/* The key prop forces a fresh instance of OrderForm every time the dialog opens */}
          <OrderForm key={formKey} onClose={handleFormClose} initialData={initialData} isEditMode={isEditMode} />
        </div>
      </DialogContentNoXButton>
    </Dialog>
  )
}

// Export the memoized component to prevent unnecessary rerenders
export const CreateOrderDialog = memo(CreateOrderDialogComponent)
