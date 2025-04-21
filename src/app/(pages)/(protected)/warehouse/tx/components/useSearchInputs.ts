import { useState, useCallback, useEffect } from 'react';
import { useDebounce } from 'use-debounce';
import { useStockMovementStore } from '@/stores/stock-movement-store';

interface SearchInputs {
  search: string;
  itemName: string;
  customerName: string;
}

export function useSearchInputs(debounceMs = 300) {
  const store = useStockMovementStore();
  const [inputs, setInputs] = useState<SearchInputs>({
    search: store.search || '',
    itemName: store.itemName || '',
    customerName: store.customerDisplayName || '',
  });

  // Debounce all inputs together
  const [debouncedInputs] = useDebounce(inputs, debounceMs);

  // Update store when debounced values change
  useEffect(() => {
    const { search, itemName, customerName } = debouncedInputs;
    store.setSearch(search || null);
    store.setItemName(itemName || null);
    store.setCustomerName(customerName || null);
  }, [debouncedInputs, store]);

  // Keep local inputs in sync with store
  useEffect(() => {
    setInputs({
      search: store.search || '',
      itemName: store.itemName || '',
      customerName: store.customerDisplayName || '',
    });
  }, [store.search, store.itemName, store.customerDisplayName]);

  // Memoized handlers
  const handleSearchChange = useCallback((value: string) => {
    setInputs(prev => ({ ...prev, search: value }));
  }, []);

  const handleItemNameChange = useCallback((value: string) => {
    setInputs(prev => ({ ...prev, itemName: value }));
  }, []);

  const handleCustomerNameChange = useCallback((value: string) => {
    setInputs(prev => ({ ...prev, customerName: value }));
  }, []);

  return {
    inputs,
    handleSearchChange,
    handleItemNameChange,
    handleCustomerNameChange,
  };
}