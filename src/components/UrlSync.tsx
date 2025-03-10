import { useEffect, useRef } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

interface UrlSyncProps {
  store: {
    syncWithUrl: (params: URLSearchParams) => void;
    subscribe: (
      selector: (state: any) => any,
      listener: (state: any) => void
    ) => () => void;
    getState: () => any;
  };
}

export function UrlSync({ store }: UrlSyncProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isInitialized = useRef(false);

  // Initialize store from URL on mount only
  useEffect(() => {
    if (!isInitialized.current) {
      store.syncWithUrl(searchParams);
      isInitialized.current = true;
    }
  }, [searchParams, store]);

  // Subscribe to store changes to update URL
  useEffect(() => {
    const unsubscribe = store.subscribe(
      (state) => state, // Select the entire state
      (state) => {
        // Create a new URLSearchParams instance each time
        const params = new URLSearchParams();

        // Only add non-default and non-null values
        Object.entries(state).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '' &&
              !(key === 'page' && value === 1) &&
              !(key === 'pageSize' && value === 50) &&
              !(key === 'sortField' && value === 'createdAt') &&
              !(key === 'sortDirection' && value === 'desc')
          ) {
            params.set(key, String(value));
          }
        });

        const newSearch = params.toString();
        const currentSearch = searchParams.toString();

        // Only update URL if params actually changed
        if (newSearch !== currentSearch) {
          router.replace(`${pathname}${newSearch ? `?${newSearch}` : ''}`, {
            scroll: false,
          });
        }
      }
    );

    return () => unsubscribe();
  }, [pathname, router, searchParams, store]);

  return null; // This component doesn't render anything
}