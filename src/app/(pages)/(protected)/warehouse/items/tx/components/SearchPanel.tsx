"use client"
import { useState, useCallback, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ChevronDown, ChevronUp, Search, X, LoaderCircle } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { MovementType } from "@/types/stockMovement"
import { cn } from "@/lib/utils"
import { useStockMovementStore } from "@/stores/stock-movement-store"
import { useDebounce } from "@/hooks/useDebounce"

interface SearchPanelProps {
  isLoading?: boolean
}

const MOVEMENT_OPTIONS = [
  { value: 'ALL', label: 'All types' },
  { value: 'IN', label: 'IN' },
  { value: 'OUT', label: 'OUT' }
] as const

export function SearchPanel({ isLoading = false }: SearchPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [searchInput, setSearchInput] = useState('')
  const [itemNameInput, setItemNameInput] = useState('')
  const [customerNameInput, setCustomerNameInput] = useState('')
  
  const store = useStockMovementStore()
  
  // Debounce inputs
  const debouncedSearch = useDebounce(searchInput, 300)
  const debouncedItemName = useDebounce(itemNameInput, 300)
  const debouncedCustomerName = useDebounce(customerNameInput, 300)
  
  // Update store when debounced values change
  useEffect(() => {
    store.setSearch(debouncedSearch || null)
  }, [debouncedSearch, store])
  
  useEffect(() => {
    store.setItemName(debouncedItemName || null)
  }, [debouncedItemName, store])
  
  useEffect(() => {
    store.setCustomerName(debouncedCustomerName || null)
  }, [debouncedCustomerName, store])
  
  // Keep local inputs in sync with store
  useEffect(() => {
    setSearchInput(store.search || '')
    setItemNameInput(store.itemName || '')
    setCustomerNameInput(store.customerDisplayName || '')
  }, [store.search, store.itemName, store.customerDisplayName])
  
  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchInput(e.target.value)
  }, [])
  
  const handleItemNameChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setItemNameInput(e.target.value)
  }, [])
  
  const handleCustomerChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomerNameInput(e.target.value)
  }, [])
  
  const handleMovementChange = useCallback((value: string) => {
    store.setMovement(value === 'ALL' ? null : value as MovementType)
  }, [store])
  
  const handleDateChange = useCallback((key: 'from' | 'to', value: string) => {
    store.setDateRange(
      key === 'from' ? (value || null) : store.dateFrom,
      key === 'to' ? (value || null) : store.dateTo
    )
  }, [store])
  
  const toggleExpanded = useCallback(() => {
    setIsExpanded(prev => !prev)
  }, [])
  
  const hasActiveFilters = store.search || store.movement || store.itemName || 
    store.customerDisplayName || store.dateFrom || store.dateTo
  
  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <div className="flex-1 relative rounded-lg bg-white">
          {isLoading ? (
            <LoaderCircle 
              className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground animate-spin" 
            />
          ) : (
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          )}
          
          <Input
            placeholder="Search movements..."
            value={searchInput}
            onChange={handleSearchChange}
            className="pl-8"
          />
        </div>
        
        <Button
          variant="outline"
          size="icon"
          onClick={toggleExpanded}
          disabled={isLoading}
        >
          {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </Button>
        
        {hasActiveFilters && (
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={store.clearFilters}
            disabled={isLoading}
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
                value={store.movement || 'ALL'}
                onValueChange={handleMovementChange}
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MOVEMENT_OPTIONS.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Item Name</label>
              <Input
                placeholder="Filter by item..."
                value={itemNameInput}
                onChange={handleItemNameChange}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Customer</label>
              <Input
                placeholder="Filter by customer..."
                value={customerNameInput}
                onChange={handleCustomerChange}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Date Range</label>
              <div className="grid grid-cols-2 gap-2">
                <Input
                  type="date"
                  value={store.dateFrom || ''}
                  onChange={(e) => handleDateChange('from', e.target.value)}
                  disabled={isLoading}
                />
                <Input
                  type="date"
                  value={store.dateTo || ''}
                  onChange={(e) => handleDateChange('to', e.target.value)}
                  disabled={isLoading}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
