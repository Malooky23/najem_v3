"use client"

import React, { memo, useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { OrderStatus, MovementType } from "@/types/orders"
import { useCustomers, useSelectCustomerList } from "@/hooks/data-fetcher"
import { format } from "date-fns"
import { CalendarIcon, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { DateRange } from "react-day-picker"
import Loading from "@/components/ui/loading"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { CustomerList } from "@/types/customer"

interface OrderFiltersProps {
  status: OrderStatus | null
  customerId: string | null
  movement: MovementType | null
  dateRange: { from: Date; to: Date } | null
  onStatusChange: (status: OrderStatus | null) => void
  onCustomerChange: (customerId: string | null) => void
  onMovementChange: (movement: MovementType | null) => void
  onDateRangeChange: (from: Date | null, to: Date | null) => void
  onResetFilters: () => void
  isLoading?: boolean
    customers: CustomerList[] | undefined;
    isLoadingCustomers: boolean;
}

// Helper function to get date string in YYYY-MM-DD format
function getDateString(date: Date): string {
  return date.toISOString().split('T')[0]
}

// Helper function to create a date from a YYYY-MM-DD string
function createDateFromString(dateString: string): Date {
  return new Date(dateString)
}

// Make OrderFilters a default export for dynamic import
const OrderFilters = memo(function OrderFilters({
  status,
  customerId,
  movement,
  dateRange,
  onStatusChange,
  onCustomerChange,
  onMovementChange,
  onDateRangeChange,
  onResetFilters,
    isLoading,
    customers,
    isLoadingCustomers
}: OrderFiltersProps) {
//   const { data: customers, isLoading: isLoadingCustomers } = useSelectCustomerList()
  const [date, setDate] = useState<DateRange | undefined>(
    dateRange ? { from: dateRange.from, to: dateRange.to } : undefined
  )
  const [isCalendarOpen, setIsCalendarOpen] = useState(false)
  
  // Update local state when parent dateRange changes
  useEffect(() => {
    setDate(dateRange ? { from: dateRange.from, to: dateRange.to } : undefined)
  }, [dateRange])

  // Count active filters
  const activeFiltersCount = [
    status !== null,
    customerId !== null,
    movement !== null,
    dateRange !== null
  ].filter(Boolean).length
  
  // Format the date display text
  const formatDateDisplay = () => {
    if (!date?.from) return "Date Range"
    if (!date.to) return `From ${format(date.from, "PPP")}`
    return `${format(date.from, "PPP")} - ${format(date.to, "PPP")}`
  }

  const handleDateSelect = (selectedRange: DateRange | undefined) => {
    setDate(selectedRange)
    
    if (selectedRange?.from && selectedRange.to) {
      // Complete range selected - use the pure dates
      onDateRangeChange(selectedRange.from, selectedRange.to)
      setIsCalendarOpen(false)
    } else if (selectedRange === undefined) {
      // Clear button was clicked
      onDateRangeChange(null, null)
    }
    // Leave calendar open for partial selections
  }

  return (
    <div className="flex flex-wrap items-center gap-2 mb-4">
      {isLoading && (
        <div className="absolute right-2 top-2">
          <LoadingSpinner/>
        </div>
      )}
      <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
        <PopoverTrigger asChild>
          <Button
            variant={dateRange ? "default" : "outline"}
            size="sm"
            className={cn(
              "h-8 border-dashed",
              dateRange && "bg-blue-500 text-white hover:bg-blue-600"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {formatDateDisplay()}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={date?.from || new Date()}
            selected={date}
            onSelect={handleDateSelect}
            numberOfMonths={2}
          />
          <div className="flex justify-center gap-4 px-4 py-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => {
                setDate(undefined)
                onDateRangeChange(null, null)
                setIsCalendarOpen(false)
              }}
            >
              Clear
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => {
                if (date?.from && date.to) {
                  // Apply button clicked - use the pure dates
                  onDateRangeChange(date.from, date.to)
                }
                setIsCalendarOpen(false)
              }}
              disabled={!date?.from || !date?.to}
            >
              {date?.from && date?.to ? "Apply" : "Select Range"}
            </Button>
          </div>
        </PopoverContent>
      </Popover>
      
      <Select
        value={status || "ALL"}
        onValueChange={(value) => onStatusChange(value === "ALL" ? null : value as OrderStatus)}
      >
        <SelectTrigger
          className={cn(
            "h-8 w-[130px]",
            status && "bg-blue-500 text-white border-blue-500"
          )}
        >
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ALL">All Statuses</SelectItem>
          <SelectItem value="DRAFT">Draft</SelectItem>
          <SelectItem value="PENDING">Pending</SelectItem>
          <SelectItem value="PROCESSING">Processing</SelectItem>
          <SelectItem value="READY">Ready</SelectItem>
          <SelectItem value="COMPLETED">Completed</SelectItem>
          <SelectItem value="CANCELLED">Cancelled</SelectItem>
        </SelectContent>
      </Select>

      <Select
        value={movement || "ALL"}
        onValueChange={(value) => onMovementChange(value === "ALL" ? null : value as MovementType)}
      >
        <SelectTrigger
          className={cn(
            "h-8 w-[130px]",
            movement && "bg-blue-500 text-white border-blue-500"
          )}
        >
          <SelectValue placeholder="Movement" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ALL">All Movements</SelectItem>
          <SelectItem value="IN">In</SelectItem>
          <SelectItem value="OUT">Out</SelectItem>
        </SelectContent>
      </Select>

      <Select
        value={customerId || "ALL"}
        onValueChange={(value) => onCustomerChange(value === "ALL" ? null : value)}
        disabled={isLoadingCustomers}
      >
        <SelectTrigger
          className={cn(
            "h-8 w-[180px]",
            customerId && "bg-blue-500 text-white border-blue-500"
          )}
        >
          <SelectValue placeholder="Select Customer" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ALL">All Customers</SelectItem>
          {customers?.map((customer) => (
            <SelectItem key={customer.customerId} value={customer.customerId}>
              {customer.displayName}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {activeFiltersCount > 0 && (
        <Button
          variant="ghost"
          size="sm"
          className="h-8 px-2"
          onClick={onResetFilters}
        >
          <X className="h-4 w-4 mr-1" />
          Clear filters
          <Badge className="ml-1 bg-blue-500" variant="secondary">{activeFiltersCount}</Badge>
        </Button>
      )}
    </div>
  )
})

export default OrderFilters;