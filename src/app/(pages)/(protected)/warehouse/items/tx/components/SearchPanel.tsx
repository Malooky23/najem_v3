"use client"
import { memo, useState, useCallback } from "react"
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
import { useSearchInputs } from "@/hooks/useSearchInputs"

interface SearchPanelProps {
  isLoading?: boolean
}

const MOVEMENT_OPTIONS = [
  { value: 'ALL', label: 'All types' },
  { value: 'IN', label: 'IN' },
  { value: 'OUT', label: 'OUT' }
] as const

// Memoized input components for better performance
const SearchInput = memo(function SearchInput({ 
  value, 
  onChange, 
  isLoading,
  isExpanded,
  toggleExpanded
}: { 
  value: string; 
  onChange: (value: string) => void; 
  isLoading: boolean;
  isExpanded: boolean;
  toggleExpanded: () => void;
}) {
  return (
    <div className="flex-1   relative rounded-lg bg-white">
      {isLoading ? (
        <LoaderCircle 
          className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground animate-spin" 
        />
      ) : (
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
      )}
      
      <Input
        placeholder="Search movements..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="pl-8 pr-10"
      />
      
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleExpanded}
        disabled={isLoading}
        className="absolute right-0 top-0 h-9 w-9"
      >
        {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
      </Button>
    </div>
  );
});

const FilterInput = memo(function FilterInput({
  label,
  value,
  onChange,
  placeholder
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">{label}</label>
      <Input
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
});

export function SearchPanel({ isLoading = false }: SearchPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  
  const store = useStockMovementStore()
  const { 
    inputs, 
    handleSearchChange, 
    handleItemNameChange, 
    handleCustomerNameChange 
  } = useSearchInputs()
  
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
      <div className="flex gap-0">
        <SearchInput
          value={inputs.search}
          onChange={handleSearchChange}
          isLoading={isLoading}
          isExpanded={isExpanded}
          toggleExpanded={toggleExpanded}
        />
        
        {hasActiveFilters && (
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={()=>
            {
              inputs.search = ''
              store.clearFilters()}}
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

            <FilterInput
              label="Item Name"
              value={inputs.itemName}
              onChange={handleItemNameChange}
              placeholder="Filter by item..."
            />

            <FilterInput
              label="Customer"
              value={inputs.customerName}
              onChange={handleCustomerNameChange}
              placeholder="Filter by customer..."
            />

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
