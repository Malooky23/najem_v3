import { useEffect, useRef } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { StoreApi } from 'zustand';

interface Store {
    syncWithUrl: (params: URLSearchParams) => void;
    subscribe: any; // Most permissive type for subscribe
}

interface UseUrlSyncConfig {
    syncedKeys: string[];
}

export function useUrlSync(store: any, config?: UseUrlSyncConfig) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isInitialized = useRef(false);

  // Initialize store from URL on mount only
  useEffect(() => {
    console.log("useUrlSync store:", store.getState()); // Log the store object
    if (!isInitialized.current) {
      store.getState().syncWithUrl(searchParams);
      isInitialized.current = true;
    }
  }, [searchParams, store]);

  // Subscribe to store changes to update URL
  useEffect(() => {

    // Check if subscribe method exists
    if (typeof store.subscribe !== 'function') {
      console.error('Store does not have a subscribe method. URL sync will not work.');
      return;
    }

    const unsubscribe = store.subscribe(
      (state: any) => {
        // Create a new URLSearchParams instance each time
        const params = new URLSearchParams();

        // Only add non-default and non-null values
        Object.entries(state).forEach(([key, value]) => {
          if (config && config.syncedKeys && !config.syncedKeys.includes(key)) {
            return; // Skip if key is not in syncedKeys
          }
          if (value !== undefined && value !== null && value !== '' &&
              !(key === 'page' && value === 1) &&
              !(key === 'pageSize' && value === 50) &&
              !(key === 'sortField' && value === 'createdAt') &&
              !(key === 'sortDirection' && value === 'desc')
          ) {
            if (typeof value === 'object') {
                // Handle nested objects (like filters and sort)
                Object.entries(value).forEach(([subKey, subValue]) => {
                    if (subValue !== undefined && subValue !== null && subValue !== '') {
                        params.set(subKey, String(subValue));
                    }
                });
            } else {
                params.set(key, String(value));
            }
          }
        });

        const newSearch = params.toString();
        const currentSearch = searchParams.toString();

        console.log("useUrlSync - State before URL update:", state);
        console.log("useUrlSync - selectedOrderId:", state.selectedOrderId);
        console.log("useUrlSync - New Search Params:", newSearch);
        console.log("useUrlSync - Current Search Params:", currentSearch);

        // Only update URL if params actually changed
        if (newSearch !== currentSearch) {
          router.replace(`${pathname}${newSearch ? `?${newSearch}` : ''}`, {
            scroll: false,
          });
        }
      }
    );

    return () => unsubscribe();
  }, [pathname, router, searchParams, store, config]);
}
