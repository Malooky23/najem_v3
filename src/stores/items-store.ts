import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { StateCreator } from 'zustand';
// Assuming ItemSchemaType exists, adjust the import path if necessary
import type { ItemSchemaType } from '@/types/items'; // Added import

export interface ItemsState {
  // UI State
  selectedItemId: string | null;
  selectedItemData: ItemSchemaType | null; // Added: Store data of the selected item
  isDetailsOpen: boolean;

  // Pagination State
  currentPage: number;
  pageSize: number;
  totalPages: number;
  total: number;

  // Actions
  selectItem: (id: string | null, data?: ItemSchemaType | null) => void; // Modified: Accept optional data
  closeDetails: () => void;
  setPage: (page: number) => void;
  setPageSize: (size: number) => void;
  setTotalItems: (total: number) => void;
}

export type StoreWithSubscribe = StateCreator<
  ItemsState,
  [ [ 'zustand/subscribeWithSelector', never ] ],
  [],
  ItemsState
>;

const createItemsStore: StoreWithSubscribe = (set) => ({
  // Initial state
  selectedItemId: null,
  selectedItemData: null, // Added initial state
  isDetailsOpen: false,

  // Pagination initial state
  currentPage: 1,
  pageSize: 100,
  totalPages: 1,
  total: 0,

  // Actions
  selectItem: (id, data = null) => set({ // Modified: Accept and store data
    selectedItemId: id,
    selectedItemData: id ? data : null, // Store data only if id is not null
    isDetailsOpen: !!id
  }),

  closeDetails: () => set({
    selectedItemId: null,
    selectedItemData: null, // Added: Clear data on close
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
  [ [ 'zustand/subscribeWithSelector', never ] ]
>(subscribeWithSelector(createItemsStore));