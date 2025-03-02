"use client"

import { useState, useCallback, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ChevronDown, ChevronUp, LoaderCircle, LoaderPinwheel, Search, X } from "lucide-react"
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
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { is } from "drizzle-orm"

interface SearchBarProps {
  isLoading?: boolean
}


export function SearchBar({isLoading}: SearchBarProps) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [isExpanded, setIsExpanded] = useState(false)

  // Local state for immediate input feedback
  const [searchInput, setSearchInput] = useState(searchParams.get("search") || "")
  const [itemNameInput, setItemNameInput] = useState(searchParams.get("itemName") || "")
  const [customerInput, setCustomerInput] = useState(searchParams.get("customerDisplayName") || "")

  // Debounced values for URL updates
  const debouncedSearch = useDebounce(searchInput, 300)
  const debouncedItemName = useDebounce(itemNameInput, 300)
  const debouncedCustomer = useDebounce(customerInput, 300)

  // Get other filter values from URL
  const movement = searchParams.get("movement") as MovementType | null
  const dateFrom = searchParams.get("dateFrom") || ""
  const dateTo = searchParams.get("dateTo") || ""

  const updateUrlParams = useCallback((updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams)
    Object.entries(updates).forEach(([key, value]) => {
      if (value === null) {
        params.delete(key)
      } else {
        params.set(key, value)
      }
    })
    router.replace(`?${params.toString()}`)
  }, [searchParams, router])

  // Update URL when debounced values change
  useEffect(() => {
    updateUrlParams({ search: debouncedSearch || null })
  }, [debouncedSearch, updateUrlParams])

  useEffect(() => {
    updateUrlParams({ itemName: debouncedItemName || null })
  }, [debouncedItemName, updateUrlParams])

  useEffect(() => {
    updateUrlParams({ customerDisplayName: debouncedCustomer || null })
  }, [debouncedCustomer, updateUrlParams])

  const clearFilters = () => {
    setSearchInput("")
    setItemNameInput("")
    setCustomerInput("")
    updateUrlParams({
      search: null,
      movement: null,
      itemName: null,
      customerDisplayName: null,
      dateFrom: null,
      dateTo: null
    })
  }

  return (
    <div className="space-y-2 bg-white p-4 rounded-lg border">
      <div className="flex gap-2">

        <div className="flex-1 relative">
        {isLoading ? (
          <LoaderCircle color="#f56b16"
          className={cn(
            "absolute left-2 top-2.5 h-4 w-4 text-muted-foreground transition-transform",
            isLoading && "animate-[spin_1s_linear_infinite]"
          )}
        />          ) : (<Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />)}
          
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
        {(searchInput || movement || itemNameInput || customerInput || dateFrom || dateTo) && (
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
          isExpanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        )}
      >
        <div className="min-h-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Movement Type</label>
              <Select
                value={movement || undefined}
                onValueChange={(value) => updateUrlParams({ movement: value || null })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All types" />
                </SelectTrigger>
                <SelectContent>
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
                  value={dateFrom}
                  onChange={(e) => updateUrlParams({ dateFrom: e.target.value })}
                />
                <Input
                  type="date"
                  value={dateTo}
                  onChange={(e) => updateUrlParams({ dateTo: e.target.value })}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}