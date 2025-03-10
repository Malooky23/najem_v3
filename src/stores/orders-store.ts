import { create } from 'zustand';
import { OrderFilters, OrderSort, OrderStatus } from '@/types/orders';

interface OrdersState {
  // UI state
  selectedOrderId: string | null;
  isDetailsOpen: boolean;
  
  // Filter/pagination state
  filters: OrderFilters;
  page: number;
  pageSize: number;
  sort: OrderSort;
  
  // UI actions
  selectOrder: (orderId: string | null) => void;
  closeOrderDetails: () => void;
  
  // Filter/sort actions
  setPage: (page: number) => void;
  setPageSize: (pageSize: number) => void;
  setSort: (field: string, direction: 'asc' | 'desc') => void;
  setFilter: (key: keyof OrderFilters, value: any) => void;
  resetFilters: () => void;
}

const DEFAULT_FILTERS: OrderFilters = {
  status: undefined,
  customerId: undefined,
  movement: undefined,
  dateRange: undefined
};

export const useOrdersStore = create<OrdersState>((set) => ({
  // UI state with defaults
  selectedOrderId: null,
  isDetailsOpen: false,
  
  // Data state with defaults
  filters: DEFAULT_FILTERS,
  page: 1,
  pageSize: 10,
  sort: { field: 'createdAt', direction: 'desc' },
  
  // UI actions
  selectOrder: (orderId) => set(state => {
    // If selecting the same order that's already selected, just ignore
    if (state.selectedOrderId === orderId && state.isDetailsOpen) {
      return state;
    }
    return {
      selectedOrderId: orderId,
      isDetailsOpen: !!orderId
    };
  }),
  
  closeOrderDetails: () => set({ isDetailsOpen: false }),
  
  // Data actions
  setPage: (page) => set({ page }),
  setPageSize: (pageSize) => set({ pageSize }),
  setSort: (sort) => set({ sort }),
  setFilter: (key, value) => set(state => ({
    filters: {
      ...state.filters,
      [key]: value
    },
    // Reset to first page when changing filters
    page: 1
  })),
  resetFilters: () => set({ 
    filters: DEFAULT_FILTERS,
    page: 1
  })
}));