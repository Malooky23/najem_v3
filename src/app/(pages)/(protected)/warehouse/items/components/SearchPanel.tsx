"use client"
import { useState, useCallback } from "react"
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
import { cn } from "@/lib/utils"

interface SearchPanelProps {
  isLoading?: boolean
}

const CATEGORY_OPTIONS = [
  { value: 'ALL', label: 'All categories' },
  { value: 'ELECTRONICS', label: 'Electronics' },
  { value: 'CLOTHING', label: 'Clothing' },
  { value: 'BOOKS', label: 'Books' },
  { value: 'OTHER', label: 'Other' }
] as const

const STATUS_OPTIONS = [
  { value: 'ALL', label: 'All statuses' },
  { value: 'ACTIVE', label: 'Active' },
  { value: 'INACTIVE', label: 'Inactive' },
  { value: 'OUT_OF_STOCK', label: 'Out of Stock' }
] as const

export function SearchPanel({ isLoading = false }: SearchPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  
  const toggleExpanded = useCallback(() => {
    setIsExpanded(prev => !prev)
  }, [])
  
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
            placeholder="Search items..."
            value=""
            disabled
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Category</label>
              <Select
                value="ALL"
                disabled
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORY_OPTIONS.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select
                value="ALL"
                disabled
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}