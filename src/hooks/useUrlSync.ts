import { useEffect, useRef } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useStockMovementStore } from '@/stores/stock-movement-store';

export function useUrlSync() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isInitialized = useRef(false);
  
  // Initialize store from URL on mount only
  useEffect(() => {
    if (!isInitialized.current) {
      const store = useStockMovementStore.getState();
      store.syncWithUrl(searchParams);
      isInitialized.current = true;
    }
  }, [searchParams]);

  // Subscribe to store changes to update URL
  useEffect(() => {
    const unsubscribe = useStockMovementStore.subscribe(
      (state) => ({
        page: state.page,
        pageSize: state.pageSize,
        sortField: state.sortField,
        sortDirection: state.sortDirection,
        search: state.search,
        movement: state.movement,
        itemName: state.itemName,
        customerDisplayName: state.customerDisplayName,
        dateFrom: state.dateFrom,
        dateTo: state.dateTo,
        selectedMovementId: state.selectedMovementId
      }),
      (state) => {
        // Create a new URLSearchParams instance each time
        const params = new URLSearchParams();

        // Only add non-default and non-null values
        if (state.page !== 1) {
          params.set('page', state.page.toString());
        }
        if (state.pageSize !== 10) {
          params.set('pageSize', state.pageSize.toString());
        }
        if (state.sortField !== 'createdAt') {
          params.set('sort', state.sortField);
        }
        if (state.sortDirection !== 'desc') {
          params.set('direction', state.sortDirection);
        }
        if (state.search) {
          params.set('search', state.search);
        }
        if (state.movement) {
          params.set('movement', state.movement);
        }
        if (state.itemName) {
          params.set('itemName', state.itemName);
        }
        if (state.customerDisplayName) {
          params.set('customerDisplayName', state.customerDisplayName);
        }
        if (state.dateFrom) {
          params.set('dateFrom', state.dateFrom);
        }
        if (state.dateTo) {
          params.set('dateTo', state.dateTo);
        }
        if (state.selectedMovementId) {
          params.set('movementId', state.selectedMovementId);
        }

        const newSearch = params.toString();
        const currentSearch = searchParams.toString();
        
        // Only update URL if params actually changed
        if (newSearch !== currentSearch) {
          router.replace(`${pathname}${newSearch ? `?${newSearch}` : ''}`, { 
            scroll: false 
          });
        }
      }
    );

    return () => unsubscribe();
  }, [pathname, router, searchParams]);
}