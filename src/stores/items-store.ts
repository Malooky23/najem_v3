import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { StateCreator } from 'zustand';
import { is } from 'drizzle-orm';

interface ItemsState {
  // UI State
  selectedItemId: string | null;
  isDetailsOpen: boolean;
  
  // Pagination State
  currentPage: number;
  pageSize: number;
  totalPages: number;
  total: number;
  
  // Actions
  selectItem: (id: string | null) => void;
  closeDetails: () => void;
  setPage: (page: number) => void;
  setPageSize: (size: number) => void;
  setTotalItems: (total: number) => void;
}

type StoreWithSubscribe = StateCreator<
  ItemsState,
  [['zustand/subscribeWithSelector', never]],
  [],
  ItemsState
>;

const createItemsStore: StoreWithSubscribe = (set) => ({
  // Initial state
  selectedItemId: null,
  isDetailsOpen: false,
  
  // Pagination initial state
  currentPage: 1,
  pageSize: 100,
  totalPages: 1,
  total: 0,
  
  // Actions
  selectItem: (id) => set({ 
    selectedItemId: id,
    isDetailsOpen: !!id 
  }),
  
  closeDetails: () => set({ 
    selectedItemId: null,
    isDetailsOpen: false 
  }),
  
  setPage: (page) => set({ currentPage: page }),
  
  setPageSize: (size) => set((state) => {
    const totalPages = Math.ceil(state.total / size);
    // Ensure current page is still valid with new page size
    const adjustedCurrentPage = Math.min(state.currentPage, totalPages);
    return { 
      pageSize: size, 
      totalPages: totalPages || 1,
      currentPage: adjustedCurrentPage || 1
    };
  }),
  
  setTotalItems: (total) => set((state) => {
    const totalPages = Math.ceil(total / state.pageSize);
    // Ensure current page is still valid
    const adjustedCurrentPage = Math.min(state.currentPage, totalPages);
    return { 
      total, 
      totalPages: totalPages || 1,
      currentPage: adjustedCurrentPage || 1
    };
  }),
});

export const useItemsStore = create<
  ItemsState,
  [['zustand/subscribeWithSelector', never]]
>(subscribeWithSelector(createItemsStore));