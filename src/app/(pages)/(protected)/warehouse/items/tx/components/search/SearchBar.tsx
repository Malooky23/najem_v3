"use client"

import { useState, useCallback, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ChevronDown, ChevronUp, LoaderCircle, Search, X } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { MovementType, StockMovementFilters } from "@/types/stockMovement"
import { cn } from "@/lib/utils"
import { useDebounce } from "@/hooks/useDebounce"

interface SearchBarProps {
  isLoading?: boolean
  filters: StockMovementFilters
  onFilterChange: (filters: StockMovementFilters) => void
}

export function SearchBar({ isLoading, filters, onFilterChange }: SearchBarProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [dateRange, setDateRange] = useState({
    from: filters.dateRange?.from?.toISOString().split('T')[0] || '',
    to: filters.dateRange?.to?.toISOString().split('T')[0] || ''
  })

  // Local state for immediate input feedback
  const [searchInput, setSearchInput] = useState(filters.search || "")
  const [itemNameInput, setItemNameInput] = useState(filters.itemName || "")
  const [customerInput, setCustomerInput] = useState(filters.customerDisplayName || "")
  const [movementType, setMovementType] = useState<string>(filters.movement || "ALL")

  // Debounced values for filter updates
  const debouncedSearch = useDebounce(searchInput, 300)
  const debouncedItemName = useDebounce(itemNameInput, 300)
  const debouncedCustomer = useDebounce(customerInput, 300)

  // Effect handlers for debounced updates
  useEffect(() => {
    const newFilters = { ...filters }
    
    if (debouncedSearch !== filters.search) {
      newFilters.search = debouncedSearch || undefined
    }
    if (debouncedItemName !== filters.itemName) {
      newFilters.itemName = debouncedItemName || undefined
    }
    if (debouncedCustomer !== filters.customerDisplayName) {
      newFilters.customerDisplayName = debouncedCustomer || undefined
    }
    
    // Only trigger update if filters actually changed
    if (JSON.stringify(newFilters) !== JSON.stringify(filters)) {
      onFilterChange(newFilters)
    }
  }, [
    debouncedSearch,
    debouncedItemName,
    debouncedCustomer,
    filters,
    onFilterChange
  ])

  // Effect for movement type
  useEffect(() => {
    if (movementType !== (filters.movement || "ALL")) {
      const newFilters = { ...filters }
      if (movementType === "ALL") {
        delete newFilters.movement
      } else {
        newFilters.movement = movementType as MovementType
      }
      onFilterChange(newFilters)
    }
  }, [movementType, filters, onFilterChange])

  const clearFilters = () => {
    setSearchInput("")
    setItemNameInput("")
    setCustomerInput("")
    setMovementType("ALL")
    setDateRange({ from: '', to: '' })
    onFilterChange({})
  }

  const handleDateChange = (type: 'from' | 'to', value: string) => {
    const newDateRange = { ...dateRange, [type]: value }
    setDateRange(newDateRange)

    // Only update filters if both dates are present
    if (newDateRange.from && newDateRange.to) {
      const fromDate = new Date(newDateRange.from)
      const toDate = new Date(newDateRange.to)
      
      // Ensure the dates are valid before updating filters
      if (!isNaN(fromDate.getTime()) && !isNaN(toDate.getTime())) {
        const newFilters = {
          ...filters,
          dateRange: {
            from: fromDate,
            to: toDate
          }
        }
        onFilterChange(newFilters)
      }
    } else {
      // If either date is missing, remove the dateRange filter
      const { dateRange: _, ...restFilters } = filters
      onFilterChange(restFilters)
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <div className="flex-1 relative rounded-lg bg-white">
          {isLoading ? (
            <LoaderCircle
              color="#f56b16"
              className={cn(
                "absolute left-2 top-2.5 h-4 w-4 text-muted-foreground transition-transform",
                isLoading && "animate-[spin_1s_linear_infinite]"
              )}
            />
          ) : (
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          )}
          
          <Input
            placeholder="Search movements..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="pl-8"
          />
        </div>
        <Button
          variant="outline"
          size="icon"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </Button>
        {(searchInput || movementType !== "ALL" || itemNameInput || customerInput || filters.dateRange) && (
          <Button
            variant="ghost"
            size="icon"
            onClick={clearFilters}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      <div
        className={cn(
          "grid gap-4 overflow-hidden transition-all duration-200",
          isExpanded ? 
          "grid-rows-[1fr] pb-4 px-4 bg-white rounded-lg border" :
           "grid-rows-[0fr]"
        )}
      >
        <div className="min-h-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Movement Type</label>
              <Select
                value={movementType}
                onValueChange={setMovementType}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All</SelectItem>
                  <SelectItem value="IN">IN</SelectItem>
                  <SelectItem value="OUT">OUT</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Item Name</label>
              <Input
                placeholder="Filter by item..."
                value={itemNameInput}
                onChange={(e) => setItemNameInput(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Customer</label>
              <Input
                placeholder="Filter by customer..."
                value={customerInput}
                onChange={(e) => setCustomerInput(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Date Range</label>
              <div className="grid grid-cols-2 gap-2">
                <Input
                  type="date"
                  value={dateRange.from}
                  onChange={(e) => handleDateChange('from', e.target.value)}
                />
                <Input
                  type="date"
                  value={dateRange.to}
                  onChange={(e) => handleDateChange('to', e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}