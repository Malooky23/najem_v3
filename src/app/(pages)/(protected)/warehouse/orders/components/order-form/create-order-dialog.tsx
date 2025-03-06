"use client"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { PlusIcon } from "lucide-react"
import  OrderForm  from "./OrderForm"
import { useState, memo, useCallback } from "react"

interface CreateOrderDialogProps {
  isMobile?: boolean
}

// Create a memoized dialog trigger button
const CreateOrderButton = memo(({ onClick, isMobile }: { onClick: () => void, isMobile?: boolean }) => (
  <Button onClick={onClick} size={isMobile ? "sm" : "default"} className="gap-2">
    <PlusIcon size={16} />
    <span>Create Order</span>
  </Button>
));

CreateOrderButton.displayName = "CreateOrderButton";

function CreateOrderDialogComponent({ isMobile = false }: CreateOrderDialogProps) {
  const [isOpen, setIsOpen] = useState(false)
  
  // Use useCallback to maintain stable reference
  const handleOpenChange = useCallback((open: boolean) => {
    setIsOpen(open)
  }, [])
  
  const handleButtonClick = useCallback(() => {
    setIsOpen(true)
  }, [])

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      {/* Use the memoized button component */}
      <CreateOrderButton onClick={handleButtonClick} isMobile={isMobile} />
      
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Order</DialogTitle>
        </DialogHeader>
        <OrderForm onClose={() => setIsOpen(false)} />
      </DialogContent>
    </Dialog>
  )
}

// Export the memoized component to prevent unnecessary rerenders
export const CreateOrderDialog = memo(CreateOrderDialogComponent);