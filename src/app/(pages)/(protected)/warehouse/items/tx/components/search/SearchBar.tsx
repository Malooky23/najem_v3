"use client"

import { useState, useCallback, memo, useRef } from "react"
import { useSearchParams, useRouter, usePathname } from "next/navigation"
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
import { MovementType } from "@/types/stockMovement"
import { cn } from "@/lib/utils"
import { useDebounce } from "@/hooks/useDebounce"

interface SearchBarProps {
  isLoading?: boolean
}

// Memoized button components to prevent unnecessary re-renders
const FilterButton = memo(({
  isExpanded,
  onClick
}: {
  isExpanded: boolean,
  onClick: () => void
}) => (
  <Button
    variant="outline"
    size="icon"
    onClick={onClick}
  >
    {isExpanded ? (
      <ChevronUp className="h-4 w-4" />
    ) : (
      <ChevronDown className="h-4 w-4" />
    )}
  </Button>
));

FilterButton.displayName = "FilterButton";

const ClearButton = memo(({
  onClick
}: {
  onClick: () => void
}) => (
  <Button
    variant="ghost"
    size="icon"
    onClick={onClick}
  >
    <X className="h-4 w-4" />
  </Button>
));

ClearButton.displayName = "ClearButton";

// Main component as a function component that is memoized
function SearchBarComponent({isLoading = false}: SearchBarProps) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  const [isExpanded, setIsExpanded] = useState(false)
  
  // Use ref instead of state+effect for tracking initial mount
  const initialMountRef = useRef(true)
  
  // Track last URL update to prevent duplicates
  const lastUrlUpdateRef = useRef<string | null>(null)

  // Extract initial values from URL once (no need for useEffect)
  const initialSearch = searchParams.get("search") || ""
  const initialItemName = searchParams.get("itemName") || ""
  const initialCustomer = searchParams.get("customerDisplayName") || ""
  const initialDateFrom = searchParams.get("dateFrom") || ""
  const initialDateTo = searchParams.get("dateTo") || ""
  const initialMovement = searchParams.get("movement") as MovementType | null

  // Local state for immediate input feedback
  const [searchInput, setSearchInput] = useState(initialSearch)
  const [itemNameInput, setItemNameInput] = useState(initialItemName)
  const [customerInput, setCustomerInput] = useState(initialCustomer)

  // Function to update URL parameters - direct action, not an effect
  const updateUrlParams = useCallback((updates: Record<string, string | null>) => {
    // Skip during initial mount if that flag is set
    if (initialMountRef.current) {
      initialMountRef.current = false;
      return;
    }
    
    const params = new URLSearchParams(searchParams.toString())
    let hasChanges = false
    
    Object.entries(updates).forEach(([key, value]) => {
      const currentValue = params.get(key)
      
      if (value === null || value === "") {
        if (currentValue !== null) {
          params.delete(key)
          hasChanges = true
        }
      } else if (currentValue !== value) {
        params.set(key, value)
        hasChanges = true
      }
    })
    
    // Only update if changes were made
    if (hasChanges) {
      const newUrl = `${pathname}?${params.toString()}`
      
      // Prevent duplicate navigation to the same URL
      if (lastUrlUpdateRef.current === newUrl) {
        return
      }
      
      lastUrlUpdateRef.current = newUrl
      router.replace(newUrl, { scroll: false })
    }
  }, [searchParams, router, pathname])

  // Create handlers that update URL directly rather than through effects
  const handleSearchChange = useDebounce((value: string) => {
    updateUrlParams({ search: value || null })
  }, 500)
  
  const handleItemNameChange = useDebounce((value: string) => {
    updateUrlParams({ itemName: value || null })
  }, 500)
  
  const handleCustomerChange = useDebounce((value: string) => {
    updateUrlParams({ customerDisplayName: value || null })
  }, 500)

  // When input values change, update local state and trigger the debounced handlers
  const onSearchInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchInput(value);
    handleSearchChange(value);
  }, [handleSearchChange]);

  const onItemNameInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setItemNameInput(value);
    handleItemNameChange(value);
  }, [handleItemNameChange]);

  const onCustomerInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCustomerInput(value);
    handleCustomerChange(value);
  }, [handleCustomerChange]);

  // Handle filter toggle - simple state toggle, no effect needed
  const toggleExpanded = useCallback(() => {
    setIsExpanded(prev => !prev)
  }, [])

  // Handle clear filters - direct action
  const clearFilters = useCallback(() => {
    // Update local state
    setSearchInput("")
    setItemNameInput("")
    setCustomerInput("")
    
    // Clear URL parameters directly
    updateUrlParams({
      search: null,
      movement: null,
      itemName: null,
      customerDisplayName: null,
      dateFrom: null,
      dateTo: null
    })
  }, [updateUrlParams])

  // Handle movement type change - direct action
  const handleMovementChange = useCallback((value: string) => {
    updateUrlParams({ movement: value === "ALL" ? null : value })
  }, [updateUrlParams])

  // Handle date change - direct action
  const handleDateChange = useCallback((key: 'dateFrom' | 'dateTo', value: string) => {
    updateUrlParams({ [key]: value || null })
  }, [updateUrlParams])

  // Derived state for showing clear button - computed directly
  const showClearButton = searchInput || initialMovement || itemNameInput || customerInput || initialDateFrom || initialDateTo

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
            onChange={onSearchInputChange}
            className="pl-8"
          />
        </div>
        
        <FilterButton isExpanded={isExpanded} onClick={toggleExpanded} />
        
        {showClearButton && <ClearButton onClick={clearFilters} />}
      </div>

      <div
        className={cn(
          "grid gap-4 overflow-hidden transition-all duration-200 ",
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
                value={initialMovement || "ALL"}
                onValueChange={handleMovementChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All types</SelectItem>
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
                onChange={onItemNameInputChange}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Customer</label>
              <Input
                placeholder="Filter by customer..."
                value={customerInput}
                onChange={onCustomerInputChange}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Date Range</label>
              <div className="grid grid-cols-2 gap-2">
                <Input
                  type="date"
                  value={initialDateFrom}
                  onChange={(e) => handleDateChange('dateFrom', e.target.value)}
                />
                <Input
                  type="date"
                  value={initialDateTo}
                  onChange={(e) => handleDateChange('dateTo', e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Export memoized version of the component
export const SearchBar = memo(SearchBarComponent);