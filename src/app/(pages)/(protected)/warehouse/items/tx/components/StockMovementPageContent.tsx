"use client"
import { useCallback, useState, useMemo, useRef } from "react"
import { useSearchParams, useRouter, usePathname } from "next/navigation"
import { useMediaQuery } from "@/hooks/use-media-query"
import { cn } from "@/lib/utils"
import { SearchBar } from "./search/SearchBar"
import {
  type StockMovementSortFields,
  type MovementType
} from "@/types/stockMovement"
import React from "react"
import { StockMovementsTable } from "./StockMovementsTable"
import { DetailsPanel } from "./DetailsPanel"

// Main client component that handles the layout and URL state
export function StockMovementPageContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  const isMobile = useMediaQuery("(max-width: 768px)")
  const [isLocalLoading, setIsLocalLoading] = useState(false);
  
  // Track URL navigation to prevent duplicates
  const lastNavigationRef = useRef<string | null>(null);
  
  // Extract search params with correct null/undefined handling
  const urlParams = useMemo(() => {
    const page = Number(searchParams.get('page')) || 1
    const pageSize = Number(searchParams.get('pageSize')) || 10
    const sortField = (searchParams.get('sort') || 'createdAt') as StockMovementSortFields
    const sortDirection = (searchParams.get('direction') || 'desc') as 'asc' | 'desc'
    const search = searchParams.get('search')
    const movement = searchParams.get('movement') as MovementType | null
    const itemName = searchParams.get('itemName')
    const customerDisplayName = searchParams.get('customerDisplayName')
    const dateFrom = searchParams.get('dateFrom')
    const dateTo = searchParams.get('dateTo')
    const selectedMovementId = searchParams.get('movementId')
    
    return {
      page,
      pageSize,
      sortField,
      sortDirection,
      search,
      movement,
      itemName,
      customerDisplayName,
      dateFrom,
      dateTo,
      selectedMovementId,
      isDetailsOpen: !!selectedMovementId
    }
  }, [searchParams]);
  
  // URL update helper function - fixed to properly handle loading states
  const updateUrl = useCallback((params: URLSearchParams) => {
    const newUrl = `${pathname}?${params.toString()}`;
    
    // Prevent duplicate navigations
    if (lastNavigationRef.current === newUrl) {
      setIsLocalLoading(false); // Reset loading state if URL is the same
      return;
    }
    
    // Set loading state and update URL
    setIsLocalLoading(true);
    lastNavigationRef.current = newUrl;
    
    // Use router.replace with a callback to handle after-navigation tasks if needed
    router.replace(newUrl, { scroll: false });
  }, [router, pathname]);

  // Handle closing the details panel
  const handleCloseDetails = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete('movementId');
    updateUrl(params);
  }, [searchParams, updateUrl]);

  // Determine if anything is loading
  const [isFetching, setIsFetching] = useState(false);
  const updateFetchingState = useCallback((fetching: boolean) => {
    setIsFetching(fetching);
  }, []);

  return (
    <div className="px-4 h-[calc(100vh-3rem)] flex flex-col">
      {/* Page Header */}
      <div className="flex justify-between mt-2">
        <h1 className="text-2xl font-bold text-gray-900 text-nowrap pr-2">
          Item Movements
        </h1>
        <SearchBar isLoading={isLocalLoading || isFetching} />
      </div>
      
      <div className="flex gap-4 flex-1 min-h-0 overflow-hidden mt-0">
        {/* Table Section */}
        <div
          className={cn(
            "flex flex-col rounded-md transition-all duration-300",
            isMobile ? (urlParams.isDetailsOpen ? "hidden" : "w-full") : (urlParams.isDetailsOpen ? "w-[40%]" : "w-full"),
          )}
        >
          <StockMovementsTable
            urlParams={urlParams}
            updateUrl={updateUrl}
            setIsLocalLoading={setIsLocalLoading}
            isLocalLoading={isLocalLoading}
            isMobile={isMobile}
            onFetchingChange={updateFetchingState}
          />
        </div>

        {/* Details Panel */}
        {urlParams.isDetailsOpen && (
          <DetailsPanel
            // selectedMovementId={urlParams.selectedMovementId}
            isMobile={isMobile}
            // handleClose={handleCloseDetails}
          />
        )}
      </div>
    </div>
  );
}
