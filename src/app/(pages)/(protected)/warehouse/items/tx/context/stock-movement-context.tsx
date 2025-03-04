"use client"

import { createContext, useContext, useState, PropsWithChildren } from 'react'
import { StockMovementFilters, StockMovementSort, type EnrichedStockMovementView } from "@/types/stockMovement"

interface StockMovementContextType {
  filters: StockMovementFilters
  setFilters: (filters: StockMovementFilters) => void
  sort: StockMovementSort
  setSort: (sort: StockMovementSort) => void
  selectedMovementId: string | null
  setSelectedMovementId: (id: string | null) => void
  initialData?: {
    movements: EnrichedStockMovementView[]
    pagination: {
      total: number
      pageSize: number
      currentPage: number
      totalPages: number
    }
  }
}

const defaultSort: StockMovementSort = {
  field: 'createdAt',
  direction: 'desc'
}

const StockMovementContext = createContext<StockMovementContextType | undefined>(undefined)

export function StockMovementProvider({ 
  children,
  initialData
}: PropsWithChildren<{ 
  initialData?: StockMovementContextType['initialData']
}>) {
  const [filters, setFilters] = useState<StockMovementFilters>({})
  const [sort, setSort] = useState<StockMovementSort>(defaultSort)
  const [selectedMovementId, setSelectedMovementId] = useState<string | null>(null)

  // Memoize the context value to prevent unnecessary re-renders
  const value = {
    filters,
    setFilters,
    sort,
    setSort,
    selectedMovementId,
    setSelectedMovementId,
    initialData
  }

  return (
    <StockMovementContext.Provider value={value}>
      {children}
    </StockMovementContext.Provider>
  )
}

export function useStockMovementContext() {
  const context = useContext(StockMovementContext)
  if (context === undefined) {
    throw new Error('useStockMovementContext must be used within a StockMovementProvider')
  }
  return context
}