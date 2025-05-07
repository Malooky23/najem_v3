'use client';

import { memo, useCallback, useEffect, useMemo, useState } from 'react';
import { cn } from "@/lib/utils";
import { Button } from '@/components/ui/button';
import { ItemsState, useItemsStore } from '@/stores/items-store';
import Loading from '@/components/ui/loading'; // Assuming you have a Loading component
import { X, Package2 } from 'lucide-react'; // Icons
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
  DrawerClose
} from "@/components/ui/drawer"

// Import Child Components (Create these files next)
import { ItemHeader } from './ItemHeader';
import { ItemInfoCard } from './ItemInfoCard';
import { ItemStockCard } from './ItemStockCard';
import { ItemSpecsCard } from './ItemSpecsCard';
import { ItemNotesCard } from './ItemNotesCard';
import { ItemSchemaType } from '@/types/items';
import { useShallow } from 'zustand/shallow'; // <-- Import shallow
import { useItemByIdQuery } from '@/hooks/data/useItems';

interface ItemDetailsContainerProps {
  isMobile: boolean;
  className?: string;
}

export const ItemDetailsContainer = memo(function ItemDetailsContainer({
  isMobile,
  className
}: ItemDetailsContainerProps) {

  
  const { selectedItemId, selectedItemData } = useItemsStore(useShallow(
    (state: ItemsState) => ({
      selectedItemId: state.selectedItemId,
      selectedItemData: state.selectedItemData,
    }),
  ));

  const {
    data: itemData, // This is the fetched ItemSchemaType | null
    isLoading: isQueryLoading, // Loading state for the initial fetch
    isFetching: isQueryFetching, // True if fetching (initial or background refetch)
    isError,
    error,
    isSuccess,
  } = useItemByIdQuery(selectedItemId);

  const closeDetails = useItemsStore((state: ItemsState) => state.closeDetails); // <-- Type state here
  const selectItem = useItemsStore((state: ItemsState) => state.selectItem); // <-- Type state here

  // Local drawer state for smooth animations on mobile
  const [ isDrawerOpen, setIsDrawerOpen ] = useState(!!selectedItemId);

  // Sync store state to local state when opening
  useEffect(() => {
    if (selectedItemId) {
      setIsDrawerOpen(true);
    }
  }, [ selectedItemId ]);

  // Handle controlled drawer closing
  const handleDrawerOpenChange = (open: boolean) => {
    if (!open) {
      setIsDrawerOpen(false);
      // Give animation time before updating store
      setTimeout(() => {
        closeDetails();
      }, 300);
    }
  };

  const handleClose = useCallback(() => {
    closeDetails();
  }, [ closeDetails ]);

  useEffect(() => {
    if (isSuccess && itemData) {
      selectItem(itemData.itemId, itemData); // Re-select with fresh data
    }
  }, [ isSuccess, itemData, selectItem ]);

  // --- Loading and Error States ---
  // Since we're getting data directly from the store after click,
  // the primary "loading" is just the absence of data.
  const isLoading = !selectedItemData && !!selectedItemId; // Show loading if ID selected but data not yet (should be quick)
  const showErrorState = !selectedItemData && !selectedItemId; // Or handle potential errors if fetching fails

  // --- Styling ---
  // Mimic OrderDetailsContainer styling
  const containerClass = cn(
    "flex flex-col h-full", // Ensure it takes full height
    isMobile
      ? "bg-background" // Simple background for drawer content
      : "p-0 bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 rounded-lg border-2 border-slate-200", // Desktop gradient & border
    className
  );

  const cardClass = cn(
    "bg-white/80 backdrop-blur-sm flex flex-col h-full",
    isMobile
      ? "" // No extra styling for mobile content wrapper needed if using Drawer
      : "rounded-lg shadow-xl transition-all hover:shadow-2xl" // Desktop inner card style
  );


  // --- Render Logic ---

  // 1. Handle No Selected Item
  if (!selectedItemId && !isMobile) { // Don't render placeholder on mobile, drawer handles absence
    return (
      <div className={cn(containerClass, "items-center justify-center")}>
        <p className="text-gray-500">Select an item to view details.</p>
      </div>
    );
  }

  // 2. Handle Loading State (Minimal loading as data comes from store)
  if (isLoading) {
    return (
      <div className={containerClass}>
        <div className={cn("max-w-4xl mx-auto w-full h-full", cardClass)}>
          <div className={`${isMobile ? "p-4" : "p-6"} flex justify-center items-center h-full`}>
            <Loading />
          </div>
        </div>
      </div>
    );
  }

  // 3. Handle Error or Missing Data State (If itemData somehow isn't found)
  if (!selectedItemData) {
    // This case should ideally not happen if handleRowClick works correctly
    console.warn("ItemDetailsContainer: selectedItemId exists but selectedItemData is null.");
    if (isMobile && isDrawerOpen) handleDrawerOpenChange(false); // Close drawer if data disappears
    if (!isMobile) {
      return (
        <div className={cn(containerClass, "items-center justify-center p-6 text-center")}>
          <p className="text-red-600 font-semibold mb-2">Could not load item details.</p>
          <Button onClick={handleClose} variant="outline" size="sm">Close</Button>
        </div>
      );
    }
    return null; // Don't render anything problematic on mobile if data is missing
  }

  // --- Main Content Definition ---
  // Pass selectedItemData down to children
  const detailsContent = (
    <div className="space-y-5"> {/* Add spacing between cards */}
      {/* Pass necessary props from selectedItemData */}
      <ItemInfoCard item={selectedItemData} isLoading={false} />
      <ItemStockCard item={selectedItemData} isLoading={isQueryLoading || isQueryFetching} />
      <ItemSpecsCard item={selectedItemData} isLoading={false} />
      <ItemNotesCard item={selectedItemData} isLoading={false} />
    </div>
  );


  // --- Mobile Drawer ---
  if (isMobile) {
    return (
      <Drawer
        modal={true}
        open={isDrawerOpen}
        onOpenChange={handleDrawerOpenChange} // Use controlled handler
      >
        <DrawerContent className="max-h-[90vh]">
          <DrawerHeader className="p-4 border-b">
            <div className="flex items-center justify-between gap-4">
              <div className="flex-1 min-w-0">
                <DrawerTitle className="text-lg font-semibold truncate flex items-center gap-2">
                  <Package2 className="h-5 w-5 text-primary shrink-0" />
                  {selectedItemData.itemName}
                </DrawerTitle>
                <DrawerDescription className="text-xs mt-1">
                  {selectedItemData.itemNumber}
                  {selectedItemData.itemType && ` • ${selectedItemData.itemType}`}
                </DrawerDescription>
              </div>
              <DrawerClose asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full flex-shrink-0">
                  <X className="h-4 w-4" />
                  <span className="sr-only">Close</span>
                </Button>
              </DrawerClose>
            </div>
          </DrawerHeader>

          <ScrollArea className="flex-1 overflow-y-auto">
            <div className="p-4">
              {detailsContent}
            </div>
          </ScrollArea>

          <DrawerFooter className="p-4 border-t">
            <div className="flex justify-between gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDrawerOpenChange(false)} // Use controlled handler
              >
                Close
              </Button>
              {/* Add Edit Button if needed */}
              {/* <Button size="sm">Edit Item</Button> */}
            </div>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    );
  }

  // --- Desktop Panel ---
  return (
    <div className={containerClass}>
      <div className={cn("max-w-4xl mx-auto w-full", cardClass)}>

        {/* Header Section */}
        <div className={`p-6 pb-2 pt-2 mt-0 border-b flex items-center justify-between bg-white/70 backdrop-blur-md rounded-t-lg z-10 sticky top-0`}>
          {/* Pass item data to Header */}
          <ItemHeader
            item={selectedItemData!}
            handleClose={handleClose}
            isLoading={isLoading}
          />
        </div>

        {/* Scrollable Content Area */}
        <ScrollArea className="flex-1 overflow-y-auto"> {/* Use ScrollArea */}
          <div className="px-6 pb-6 pt-4"> {/* Add padding inside ScrollArea */}
            {detailsContent}
          </div>
        </ScrollArea>

        {/* Optional Footer for Actions */}
        {/* <div className="border-t p-4 flex justify-end flex-shrink-0">
            <Button size="sm">Edit Item</Button>
        </div> */}
      </div>
    </div>
  );
});