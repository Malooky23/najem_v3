"use client"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { PlusIcon } from "lucide-react"
import OrderForm from "./OrderForm"
import { useState, memo, useCallback } from "react"
import { cn } from "@/lib/utils"

interface CreateOrderDialogProps {
  isMobile?: boolean
}

// Create a memoized dialog trigger button
const CreateOrderButton = memo(({ onClick, isMobile }: { onClick: () => void, isMobile?: boolean }) => (
  <Button 
    variant="outline" 
    onClick={onClick} 
    size={isMobile ? "sm" : "default"} 
    className={cn(
      "transition-all flex items-center gap-2",
      isMobile ? "bg-blue-500 text-white hover:bg-blue-600" : "bg-blue-50 text-blue-700 hover:bg-blue-100"
    )}
  >
    <PlusIcon size={16} />
    {!isMobile && <span>New Order</span>}
  </Button>
));

CreateOrderButton.displayName = "CreateOrderButton";

function CreateOrderDialogComponent({ isMobile = false }: CreateOrderDialogProps) {
  const [isOpen, setIsOpen] = useState(false)
  // Use a key to force re-render of form component when dialog reopens
  const [formKey, setFormKey] = useState(0)
  
  const handleOpenChange = useCallback((open: boolean) => {
    if (open) {
      // Generate a new key every time the dialog opens
      setFormKey(prev => prev + 1);
    }
    setIsOpen(open);
  }, [])
  
  const handleButtonClick = useCallback(() => {
    setFormKey(prev => prev + 1);
    setIsOpen(true);
  }, [])

  const handleFormClose = useCallback(() => {
    setIsOpen(false);
  }, []);

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <CreateOrderButton onClick={handleButtonClick} isMobile={isMobile} />
      
      <DialogContent 
        className="max-w-full sm:max-w-[95%] md:max-w-[90%] lg:max-w-[80%] xl:max-w-[1100px] h-[90vh] sm:h-[85vh] p-0 overflow-hidden"
        onInteractOutside={(e) => {
          e.preventDefault();
        }}
      >
        <DialogHeader className="px-6 py-4 border-b sticky top-0 bg-white z-10">
          <DialogTitle className="text-xl font-semibold">Create New Order</DialogTitle>
        </DialogHeader>
        <div className="flex-1 h-full overflow-hidden">
          {/* The key prop forces a fresh instance of OrderForm every time the dialog opens */}
          <OrderForm key={formKey} onClose={handleFormClose} />
        </div>
      </DialogContent>
    </Dialog>
  )
}

// Export the memoized component to prevent unnecessary rerenders
export const CreateOrderDialog = memo(CreateOrderDialogComponent);