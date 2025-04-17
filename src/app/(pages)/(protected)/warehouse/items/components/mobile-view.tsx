"use client"

import type React from "react"

import type { Table } from "@tanstack/react-table"
import { useRef, useState, useEffect } from "react"
import { ScrollArea } from "@/components/ui/scroll-area"
import type { FilterState, ItemSchemaType } from "@/types/items"
import { MobileHeader } from "./mobile/mobile-header"
import { MobileTabs } from "./mobile/mobile-tabs"
import { MobileItemCard } from "./mobile/mobile-item-card"
import { MobileItemDetail } from "./mobile/mobile-item-detail"
import { MobileBottomNav } from "./mobile/mobile-bottom-nav"
import { MobileFilters } from "./mobile/mobile-filters"
import { MobileSearch } from "./mobile/mobile-search"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ArrowDown, Filter, X } from "lucide-react"
import { Item } from "@radix-ui/react-radio-group"
import { DetailsPanel } from "./DetailsPanel"
import { useItemsStore } from "@/stores/items-store"


interface MobileViewProps {
  table: Table<ItemSchemaType>
  globalFilter: string
  setGlobalFilter: (value: string) => void
  activeFilters: FilterState
  handleTypeFilter: (type: string) => void
  handleCustomerFilter: (customer: string) => void
  handleItemSelection: (itemId: string) => void
  clearAllFilters: () => void
  availableItemTypes: string[]
  availableCustomers: string[]
  selectedItem: ItemSchemaType | null
  setSelectedItem: (item: ItemSchemaType | null) => void
  activeTab: string
  setActiveTab: (tab: string) => void
  refreshData: () => void
  data: ItemSchemaType[]
}

export function MobileView({
  table,
  globalFilter,
  setGlobalFilter,
  activeFilters,
  handleTypeFilter,
  handleCustomerFilter,
  handleItemSelection,
  clearAllFilters,
  availableItemTypes,
  availableCustomers,
  selectedItem,
  setSelectedItem,
  activeTab,
  setActiveTab,
  refreshData,
  data,
}: MobileViewProps) {
  const [isRefreshing, setIsRefreshing] = useState(false)
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const startY = useRef(0)
  const [pullDistance, setPullDistance] = useState(0)
  const pullThreshold = 150 // Increased threshold to make it more deliberate
  const activationThreshold = pullThreshold * 0.6 // 60% of the threshold to show the "Release to refresh" message
  const indicatorHeight = 60 // Fixed height for the pull indicator
  const [pullState, setPullState] = useState<'idle' | 'pulling' | 'will-refresh' | 'refreshing'>('idle')
  const lastTouchY = useRef(0)

  // References to trigger elements
  const searchTriggerRef = useRef<HTMLElement | null>(null);
  const filterTriggerRef = useRef<HTMLElement | null>(null);

  // Find and store references to trigger elements on mount
  useEffect(() => {
    searchTriggerRef.current = document.getElementById('search-trigger-target');
    filterTriggerRef.current = document.getElementById('filter-trigger-target');
  }, []);

  // Handle search button click
  const handleSearchClick = () => {
    if (searchTriggerRef.current) {
      searchTriggerRef.current.click();
    }
  };

  // Handle filter button click
  const handleFilterClick = () => {
    if (filterTriggerRef.current) {
      filterTriggerRef.current.click();
    }
  };

  // Enhanced pull-to-refresh
  const handleTouchStart = (e: React.TouchEvent) => {
    startY.current = e.touches[0].clientY
    lastTouchY.current = e.touches[0].clientY
    
    // Only reset the pull distance if we're at the top of the scroll area
    const scrollTop = scrollAreaRef.current?.scrollTop || 0
    if (scrollTop <= 0 && pullState === 'idle') {
      setPullDistance(0)
    }
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    const currentY = e.touches[0].clientY
    lastTouchY.current = currentY
    const scrollTop = scrollAreaRef.current?.scrollTop || 0

    // Only handle pull if we're exactly at the top of the content
    if (scrollTop === 0) {
      const rawDistance = currentY - startY.current
      
      // Only process positive pulls (downward)
      if (rawDistance <= 0) {
        setPullState('idle')
        setPullDistance(0)
        return
      }
      
      // Apply resistance to make pulling feel more natural
      // The further you pull, the more resistance is applied
      const resistance = 0.5 - Math.min(rawDistance, 300) / 1000
      const distance = rawDistance * (1 - resistance)
      
      setPullDistance(distance)
      
      // Update pull state based on distance
      if (distance > activationThreshold) {
        setPullState('will-refresh')
      } else if (distance > 0) {
        setPullState('pulling')
      } else {
        setPullState('idle')
      }
    } else {
      // If we're not at the top, ensure we're in idle state
      if (pullState !== 'refreshing') {
        setPullState('idle')
        setPullDistance(0)
      }
    }
  }

  const handleTouchEnd = () => {
    // Only trigger refresh if we've pulled past the activation threshold
    if (pullState === 'will-refresh') {
      setPullState('refreshing')
      setIsRefreshing(true)
      
      // Animate the indicator to a fixed position during refresh
      setPullDistance(indicatorHeight)
      
      // Perform the refresh action
      setTimeout(() => {
        refreshData()
        
        // After refresh completes, animate back to hidden
        setTimeout(() => {
          setPullState('idle')
          setPullDistance(0)
          setIsRefreshing(false)
        }, 200) // Short delay for visual feedback after refresh
      }, 1000)
    } else {
      // If not pulled far enough, cancel the pull
      setPullState('idle')
      setPullDistance(0)
    }
  }

  // Prevent default to stop parent from scrolling on touch events
  const preventDefaultScroll = (e: React.TouchEvent) => {
    const scrollTop = scrollAreaRef.current?.scrollTop || 0;
    if (scrollTop <= 0 && e.touches[0].clientY > startY.current) {
      e.preventDefault();
    }
  };

  // Add effect to prevent body scrolling
  useEffect(() => {
    // Disable body scroll when this component mounts
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
    
    return () => {
      // Re-enable it when component unmounts
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    };
  }, []);

  // Render pull indicator component
  const renderPullIndicator = () => {
    // Only show when pulling or refreshing
    if (pullState === 'idle' && pullDistance === 0) return null;
    
    const opacity = Math.min(pullDistance / activationThreshold, 1);
    const progress = Math.min(pullDistance / activationThreshold, 1);
    
    return (
      <div 
        className="flex justify-center items-center transition-all duration-[2s] overflow-hidden"
        style={{ 
          height: `${Math.min(pullDistance, indicatorHeight)}px`,
          opacity: pullState === 'idle' ? 0 : opacity
        }}
      >
        <div className="flex flex-col items-center justify-center py-2">
          {pullState === 'refreshing' ? (
            // Show spinner during refresh
            <div className="animate-spin h-6 w-6 mb-1 border-2 border-primary border-t-transparent rounded-full" />
          ) : (
            // Show arrow that rotates based on pull progress
            // <svg 
            //   className={`h-6 w-6 mb-1 transition-transform duration-[1s] ${progress >= 1 ? 'rotate-180' : ''}`} 
            //   viewBox="0 0 24 24"
            //   fill="none"
            //   stroke="currentColor"
            //   strokeWidth="2"
            // >
            //   <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            // </svg>
            <ArrowDown               className={`h-6 w-6 mb-1 transition-transform duration-[1s] ${progress >= 1 ? 'rotate-180' : ''}`} 
            />
          )}
          <span className="text-sm font-medium transition-opacity text-primary">
            {pullState === 'refreshing' 
              ? 'Refreshing...' 
              : progress >= 1
                ? 'Release to refresh' 
                : 'Pull to refresh'
            }
          </span>
        </div>
      </div>
    );
  };
  const store = useItemsStore()
  const handleRowClick = (item: ItemSchemaType) => {
    // setSelectedItem(item)
    store.selectItem(item.itemId)
  }

  return (
    <div className="flex flex-col h-screen w-full fixed overflow-hidden touch-none bg-background">
      <MobileHeader 
        onSearchClick={handleSearchClick}
        onFilterClick={handleFilterClick}
      />

      <MobileSearch
        globalFilter={globalFilter}
        setGlobalFilter={setGlobalFilter}
        table={table}
        handleRowClick={handleRowClick}
      />

      <MobileFilters
        activeFilters={activeFilters}
        handleTypeFilter={handleTypeFilter}
        handleCustomerFilter={handleCustomerFilter}
        handleItemSelection={handleItemSelection}
        clearAllFilters={clearAllFilters}
        availableItemTypes={availableItemTypes}
        availableCustomers={availableCustomers}
        data={data}
      />

      {/* <MobileTabs activeTab={activeTab} setActiveTab={setActiveTab} availableItemTypes={availableItemTypes} /> */}

      {/* Active filters */}
      {(activeFilters.types.length > 0 ||
        activeFilters.customers.length > 0 ||
        activeFilters.selectedItems.length > 0 ||
        globalFilter) && (
        <div className="px-4 py-2 flex flex-wrap items-center gap-2 border-b">
          {globalFilter && (
            <Button
              variant="secondary"
              size="sm"
              className="h-7 text-xs gap-1 rounded-full"
              onClick={() => setGlobalFilter("")}
            >
              Search: {globalFilter.length > 10 ? globalFilter.substring(0, 10) + "..." : globalFilter}
              <X className="h-3 w-3" />
            </Button>
          )}
          {activeFilters.types.map((type) => (
            <Button
              key={type}
              variant="secondary"
              size="sm"
              className="h-7 text-xs gap-1 rounded-full"
              onClick={() => handleTypeFilter(type)}
            >
              {type}
              <X className="h-3 w-3" />
            </Button>
          ))}
          {activeFilters.customers.map((customer) => (
            <Button
              key={customer}
              variant="secondary"
              size="sm"
              className="h-7 text-xs gap-1 rounded-full"
              onClick={() => handleCustomerFilter(customer)}
            >
              {customer.length > 10 ? customer.substring(0, 10) + "..." : customer}
              <X className="h-3 w-3" />
            </Button>
          ))}
          {activeFilters.selectedItems.map((id) => {
            const item = data.find((item) => item.itemId === id)
            return (
              <Button
                key={id}
                variant="secondary"
                size="sm"
                className="h-7 text-xs gap-1 rounded-full"
                onClick={() => handleItemSelection(id)}
              >
                {item ? (item.itemName.length > 10 ? item.itemName.substring(0, 10) + "..." : item.itemName) : id}
                <X className="h-3 w-3" />
              </Button>
            )
          })}
        </div>
      )}

      {/* Mobile content */}
      <ScrollArea
        className="flex-1 px-2 pt-0  pb-16"
        ref={scrollAreaRef}
        onTouchStart={(e) => {
          handleTouchStart(e);
          preventDefaultScroll(e);
        }}
        onTouchMove={(e) => {
          handleTouchMove(e);
          preventDefaultScroll(e);
        }}
        onTouchEnd={handleTouchEnd}
      >
        {/* Pull to refresh indicator */}
        {renderPullIndicator()}

        {table.getFilteredRowModel().rows.length > 0 ? (
          table
            .getFilteredRowModel()
            .rows.map((row) => (
              <MobileItemCard key={row.id} item={row.original} onClick={() => handleRowClick(row.original)} />
            ))
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Filter className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">No items found</h3>
            <p className="text-muted-foreground mb-4">Try adjusting your filters or search terms</p>
            <Button onClick={clearAllFilters}>Clear Filters</Button>
          </div>
        )}
      </ScrollArea>

      <MobileBottomNav />
        <DetailsPanel items={data} />
      {/* Mobile item detail dialog */}
      {/* <Dialog open={!!selectedItem} onOpenChange={(open) => !open && setSelectedItem(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Item Details</DialogTitle>
          </DialogHeader>
          {selectedItem && <MobileItemDetail item={selectedItem} />}
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedItem(null)} className="w-full">
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog> */}
    </div>
  )
}

