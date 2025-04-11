"use client"

import { memo, useCallback, useState } from "react"
import { useOrdersStore } from "@/stores/orders-store"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { 
  Search, 
  Filter, 
  X, 
  Calendar, 
  Package2, 
  Building2, 
  ArrowUpDown
} from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useDebounce } from "@/hooks/use-debounce"

import { 
  Popover,
  PopoverContent,
  PopoverTrigger 
} from "@/components/ui/popover"
import { DateRangePicker } from "@/components/data-range-picker"
import  CustomerDropdown  from "@/components/ui/customer-dropdown"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { DateRange } from "react-day-picker"
import { z } from "zod"
import { orderStatusSchema } from "@/server/db/schema"

interface SearchPanelProps {
  isLoading: boolean;
}

// Define each status as a non-empty string value to avoid the empty string error
const OrderStatusOptions = [
  { value: "PENDING", label: "Pending" },
  { value: "PROCESSING", label: "Processing" },
  { value: "COMPLETED", label: "Completed" },
  { value: "CANCELLED", label: "Cancelled" }, // Fixed spelling to match the type
  { value: "DRAFT", label: "Draft" },
  { value: "READY", label: "Ready" },
];

const MovementOptions = [
  { value: "IN", label: "IN" },
  { value: "OUT", label: "OUT" },
];

// Memoized search panel component
export const SearchPanel = memo<SearchPanelProps>(function SearchPanel({ isLoading }) {
  const { 
    status, 
    customerId, 
    movement, 
    dateFrom, 
    dateTo,
    setStatus, 
    setCustomerId, 
    setMovement, 
    setDateRange, 
    clearFilters 
  } = useOrdersStore()

  // Local state for search (before debouncing)
  const [searchQuery, setSearchQuery] = useState("")
  
  // Handlers
  const handleStatusChange = useCallback((value: string) => {
    // Use null for "ALL", which resets the filter
    setStatus(value === "ALL" ? null : value as z.infer<typeof orderStatusSchema>)
  }, [setStatus])

  const handleMovementChange = useCallback((value: string) => {
    // Use null for "ALL", which resets the filter
    setMovement(value === "ALL" ? null : value as "IN" | "OUT")
  }, [setMovement])

  const handleDateRangeChange = useCallback((range: DateRange| undefined) => {
    if (range?.from && range?.to) {
      setDateRange(range.from.toISOString(), range.to.toISOString())
    } else {
      setDateRange(null, null)
    }
  }, [setDateRange])

  const handleCustomerSelect = useCallback((customerId: string) => {
    setCustomerId(customerId)
  }, [setCustomerId])

  const clearAllFilters = useCallback(() => {
    setSearchQuery("")
    clearFilters()
  }, [clearFilters])

  // Calculate active filter count for badge
  const activeFilterCount = [
    status, 
    customerId, 
    movement,
    (dateFrom && dateTo)
  ].filter(Boolean).length

  return (
    <div className="flex items-center gap-2">
      {/* Show search input on larger screens */}
      <div className="hidden md:flex relative w-[300px]">
        <Input
          placeholder="Search orders..."
          className="pl-9 h-9"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          disabled={isLoading}
        />
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        {searchQuery && (
          <button 
            className="absolute right-2.5 top-2.5" 
            onClick={() => setSearchQuery("")}
          >
            <X className="h-4 w-4 text-muted-foreground" />
          </button>
        )}
      </div>

      {/* Filters dialog (shown on mobile) */}
      <Dialog>
        <DialogTrigger asChild>
          <Button 
            variant="outline" 
            size="sm" 
            className="h-9 md:hidden"
          >
            <Search className="h-4 w-4 mr-2" />
            Search
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-[400px] p-4">
          <div className="space-y-4 py-2">
            <h2 className="font-medium">Search & Filter Orders</h2>
            <Input
              placeholder="Search orders..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <div className="grid gap-4">
              <div>
                <label className="text-sm font-medium">Status</label>
                <Select value={status || ""} onValueChange={handleStatusChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Any status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">Any status</SelectItem>
                    {OrderStatusOptions.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>              
              <div>
                <label className="text-sm font-medium">Movement</label>
                <Select value={movement || ""} onValueChange={handleMovementChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Any direction" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">Any direction</SelectItem>
                    {MovementOptions.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium">Customer</label>
                <CustomerDropdown 
                  onSelect={handleCustomerSelect} 
                  selectedCustomerId={customerId || undefined}
                />
              </div>

              <div>
                <label className="text-sm font-medium">Date Range</label>
                <DateRangePicker 
                  initialDateFrom={dateFrom ? new Date(dateFrom) : undefined}
                  initialDateTo={dateTo ? new Date(dateTo) : undefined}
                  onUpdate={handleDateRangeChange}
                />
              </div>
              
              <Button 
                variant="outline" 
                onClick={clearAllFilters}
              >
                Clear All Filters
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Filter popover (desktop) */}
      <Popover>
        <PopoverTrigger asChild>
          <Button 
            variant="outline" 
            size="sm" 
            className="h-9 hidden md:flex"
          >
            <Filter className="h-4 w-4 mr-2" />
            Filters
            {activeFilterCount > 0 && (
              <Badge 
                variant="secondary" 
                className="ml-2 h-5 px-1.5"
              >
                {activeFilterCount}
              </Badge>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[300px] p-3" align="end">
          <div className="space-y-4">
            <h4 className="font-medium">Filter Orders</h4>
            <div className="space-y-2">
              <div className="flex items-center">
                <Package2 className="h-4 w-4 mr-2 text-muted-foreground" />
                <span className="text-sm">Status</span>
              </div>
              <Select value={status || ""} onValueChange={handleStatusChange}>
                <SelectTrigger className="h-8">
                  <SelectValue placeholder="Any status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Any status</SelectItem>
                  {OrderStatusOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <div className="flex items-center">
                <ArrowUpDown className="h-4 w-4 mr-2 text-muted-foreground" />
                <span className="text-sm">Movement</span>
              </div>
              <Select value={movement || ""} onValueChange={handleMovementChange}>
                <SelectTrigger className="h-8">
                  <SelectValue placeholder="Any direction" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Any direction</SelectItem>
                  {MovementOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <div className="flex items-center">
                <Building2 className="h-4 w-4 mr-2 text-muted-foreground" />
                <span className="text-sm">Customer</span>
              </div>
              <CustomerDropdown 
                onSelect={handleCustomerSelect} 
                selectedCustomerId={customerId || undefined}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                <span className="text-sm">Date Range</span>
              </div>
              <DateRangePicker 
                initialDateFrom={dateFrom ? new Date(dateFrom) : undefined}
                initialDateTo={dateTo ? new Date(dateTo) : undefined}
                onUpdate={handleDateRangeChange}
              />
            </div>

            <Button 
              variant="outline" 
              size="sm" 
              className="w-full mt-2" 
              onClick={clearAllFilters}
            >
              Clear All Filters
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
})