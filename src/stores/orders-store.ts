import { create } from 'zustand';
import { OrderFilters, OrderSort, OrderStatus, OrderSortField } from '@/types/orders';
import { subscribeWithSelector } from 'zustand/middleware';
import { StateCreator } from 'zustand';

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
  setSort: (sort: OrderSort) => void;
  setFilter: (key: keyof OrderFilters, value: any) => void;
  resetFilters: () => void;
  syncWithUrl: (searchParams: URLSearchParams) => void;
}

const DEFAULT_FILTERS: OrderFilters = {
  status: undefined,
  customerId: undefined,
  movement: undefined,
  dateRange: undefined
};

type StoreWithSubscribe = StateCreator<
  OrdersState, 
  [['zustand/subscribeWithSelector', never]], 
  [], 
  OrdersState
>;

const createOrdersStore: StoreWithSubscribe = (set, get) => ({
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
    }),

    syncWithUrl: (searchParams) => {
        try {
            const page = Number(searchParams.get('page')) || 1;
            const pageSize = Number(searchParams.get('pageSize')) || 10;
            const sortField = (searchParams.get('sort') || 'createdAt') as OrderSortField;
            const sortDirection = (searchParams.get('direction') || 'desc') as 'asc' | 'desc';
            const status = searchParams.get('status') as OrderStatus || undefined;
            const customerId = searchParams.get('customerId') || undefined;
            const movement = searchParams.get('movement') as 'IN' | 'OUT' || undefined;

            const from = searchParams.get('from');
            const to = searchParams.get('to');
            const dateRange = from && to ? { from: new Date(from), to: new Date(to) } : undefined;

            const selectedOrderId = searchParams.get('orderId') || null;

            set({
                page,
                pageSize,
                sort: { field: sortField, direction: sortDirection },
                filters: { status, customerId, movement, dateRange },
                selectedOrderId,
                isDetailsOpen: !!selectedOrderId
            });
        } catch (error) {
            console.error('Error syncing with URL:', error);
        }
    }
});

export const useOrdersStore = create<
    OrdersState,
    [['zustand/subscribeWithSelector', never]]
>(subscribeWithSelector(createOrdersStore));