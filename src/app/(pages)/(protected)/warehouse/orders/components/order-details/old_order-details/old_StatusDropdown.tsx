import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ChevronDown } from "lucide-react"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { toast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"
import { OrderStatus, orderStatus } from "@/types/orders"

const statusColors: Record<OrderStatus, string> = {
  DRAFT: "bg-gray-500",
  PENDING: "bg-yellow-500",
  PROCESSING: "bg-blue-500",
  READY: "bg-purple-500",
  COMPLETED: "bg-green-500",
  CANCELLED: "bg-red-500",
}

interface StatusDropdownProps {
  currentStatus: OrderStatus
  onStatusChange: (status: OrderStatus) => Promise<void>
  isEditing: boolean
}

export function StatusDropdown({
  currentStatus,
  onStatusChange,
  isEditing,
}: StatusDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [pendingStatus, setPendingStatus] = useState<OrderStatus | null>(null)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleStatusSelect = async (status: OrderStatus) => {
    if (isEditing) {
      try {
        await onStatusChange(status)
      } catch (error) {
        toast({
          title: "Failed to update status",
          description: error instanceof Error ? error.message : 'An error occurred',
          variant: "destructive",
        })
      }
      return
    }

    if (status !== currentStatus) {
      setPendingStatus(status)
      setShowConfirmDialog(true)
    }
    setIsOpen(false)
  }

  const handleConfirm = async () => {
    if (!pendingStatus) return

    setIsLoading(true)
    setError(null)

    try {
      await onStatusChange(pendingStatus)
      
      toast({
        title: "Status updated successfully",
        description: `New Status: ${pendingStatus}`,
        variant: "default",
      })
      setPendingStatus(null)
      setShowConfirmDialog(false)
      setError(null)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update status'
      setError(errorMessage)
      toast({
        title: "Failed to update status",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (isEditing) {
    return (
      <Select 
        onValueChange={handleStatusSelect} 
        defaultValue={currentStatus}
        disabled={isLoading}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Select status" />
        </SelectTrigger>
        <SelectContent>
          {orderStatus.options.map((status) => (
            <SelectItem key={status} value={status}>
              {status}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    )
  }

  return (
    <>
      <div className="relative">
        <Badge
          variant="secondary"
          className={cn(
            "h-7 px-3 cursor-pointer transition-all duration-300 ease-in-out hover:shadow-md text-white",
            statusColors[currentStatus],
            isLoading && "opacity-50 cursor-not-allowed"
          )}
          onClick={() => !isLoading && setIsOpen(!isOpen)}
        >
          {currentStatus}
          <ChevronDown className="w-4 h-4 ml-1" />
        </Badge>
        {isOpen && (
          <div className="absolute top-full left-0 mt-1 w-40 bg-white rounded-md shadow-lg overflow-hidden z-10">
            {orderStatus.options.map((status) => (
              <div
                key={status}
                className={cn(
                  "px-4 py-2 cursor-pointer text-white transition-all duration-200",
                  statusColors[status],
                  "hover:opacity-80 hover:translate-x-1",
                  isLoading && "opacity-50 cursor-not-allowed pointer-events-none",
                  status === currentStatus && "font-semibold"
                )}
                onClick={() => !isLoading && handleStatusSelect(status)}
              >
                {status}
              </div>
            ))}
          </div>
        )}
      </div>

      <AlertDialog open={showConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Change Order Status</AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              Are you sure you want to change the order status from {currentStatus} to {pendingStatus}?

              {error && (
                <p className="text-red-500 text-sm bg-red-50 p-2 rounded border border-red-200">
                  Error: {error}
                </p>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              disabled={isLoading}
              onClick={() => {
                setPendingStatus(null)
                setError(null)
                setShowConfirmDialog(false)
              }}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirm}
              disabled={isLoading}
              className={cn(
                "relative",
                isLoading && "text-transparent"
              )}
            >
              {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                </div>
              )}
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}