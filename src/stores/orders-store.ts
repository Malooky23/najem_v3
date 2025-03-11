import { create } from 'zustand';
import { OrderFilters, OrderSort, OrderStatus, OrderSortField, MovementType } from '@/types/orders';
import { subscribeWithSelector } from 'zustand/middleware';
import { StateCreator } from 'zustand';

interface OrdersState {
  // Pagination
  page: number;
  pageSize: number;

  // Sorting
  sortField: OrderSortField;
  sortDirection: 'asc' | 'desc';

  // Filters
  status: OrderStatus | null;
  customerId: string | null;
  movement: MovementType | null;
  dateFrom: string | null;
  dateTo: string | null;

  // UI State
  selectedOrderId: string | null;
  isDetailsOpen: boolean;
  isLoading: boolean;

  // Actions
  setPage: (page: number) => void;
  setPageSize: (size: number) => void;
  setSort: (field: OrderSortField, direction: 'asc' | 'desc') => void;
  setStatus: (status: OrderStatus | null) => void;
  setCustomerId: (id: string | null) => void;
  setMovement: (movement: MovementType | null) => void;
  setDateRange: (from: string | null, to: string | null) => void;
  selectOrder: (id: string | null) => void;
  clearFilters: () => void;
  setLoading: (isLoading: boolean) => void;

  // Derived state
  getFilters: () => OrderFilters;
  getSort: () => OrderSort;
  syncWithUrl: (searchParams: URLSearchParams) => void;
}

// Correctly define the middleware type
type StoreWithSubscribe = StateCreator<
  OrdersState,
  [['zustand/subscribeWithSelector', never]],
  [],
  OrdersState
>;

// Create the store implementation with correct typing
const createOrdersStore: StoreWithSubscribe = (set, get) => ({
  // Default state
  page: 1,
  pageSize: 50,
  sortField: 'createdAt',
  sortDirection: 'desc',
  status: null,
  customerId: null,
  movement: null,
  dateFrom: null,
  dateTo: null,
  selectedOrderId: null,
  isDetailsOpen: false,
  isLoading: false,

  // Actions
  setPage: (page) => {
    const prevPage = get().page;
    if (prevPage !== page) {
      set({ page });
    }
  },

  setPageSize: (pageSize) => {
    const prevPageSize = get().pageSize;
    if (prevPageSize !== pageSize) {
      set({ pageSize, page: 1 });
    }
  },

  setSort: (sortField, sortDirection) => {
    const prevSortField = get().sortField;
    const prevSortDirection = get().sortDirection;
    if (prevSortField !== sortField || prevSortDirection !== sortDirection) {
      set({ sortField, sortDirection, page: 1 });
    }
  },

  setStatus: (status) => {
    const prevStatus = get().status;
    if (prevStatus !== status) {
      set({ status, page: 1 });
    }
  },

  setCustomerId: (customerId) => {
    const prevCustomerId = get().customerId;
    if (prevCustomerId !== customerId) {
      set({ customerId, page: 1 });
    }
  },

  setMovement: (movement) => {
    const prevMovement = get().movement;
    if (prevMovement !== movement) {
      set({ movement, page: 1 });
    }
  },

  setDateRange: (dateFrom, dateTo) => {
    const prevDateFrom = get().dateFrom;
    const prevDateTo = get().dateTo;
    if (prevDateFrom !== dateFrom || prevDateTo !== dateTo) {
      set({ dateFrom, dateTo, page: 1 });
    }
  },

  selectOrder: (id) => {
    const prevId = get().selectedOrderId;
    if (prevId !== id) {
      set({ selectedOrderId: id, isDetailsOpen: !!id });
    }
  },

  clearFilters: () => {
    set({
      status: null,
      customerId: null,
      movement: null,
      dateFrom: null,
      dateTo: null,
      page: 1
    });
  },

  setLoading: (isLoading) => {
    const currentIsLoading = get().isLoading;
    if (currentIsLoading !== isLoading) {
      set({ isLoading });
    }
  },

  // Derived state getters
  getFilters: () => {
    const { status, customerId, movement, dateFrom, dateTo } = get();
    const filters: OrderFilters = {};

    if (status) filters.status = status;
    if (customerId) filters.customerId = customerId;
    if (movement) filters.movement = movement;

    if (dateFrom && dateTo) {
      filters.dateRange = {
        from: new Date(dateFrom),
        to: new Date(dateTo)
      };
    }

    return filters;
  },

  getSort: () => ({
    field: get().sortField,
    direction: get().sortDirection
  }),

  // URL synchronization
  syncWithUrl: (searchParams) => {
    try {
      const page = Number(searchParams.get('page')) || 1;
      const pageSize = Number(searchParams.get('pageSize')) || 50;
      const sortField = (searchParams.get('sortField') || 'createdAt') as OrderSortField;
      const sortDirection = (searchParams.get('sortDirection') || 'desc') as 'asc' | 'desc';
      const status = searchParams.get('status') as OrderStatus | null;
      const customerId = searchParams.get('customerId');
      const movement = searchParams.get('movement') as MovementType | null;
      const dateFrom = searchParams.get('dateFrom');
      const dateTo = searchParams.get('dateTo');
      const selectedOrderId = searchParams.get('orderId');

      set({
        page,
        pageSize,
        sortField,
        sortDirection,
        status,
        customerId,
        movement,
        dateFrom,
        dateTo,
        selectedOrderId,
        isDetailsOpen: !!selectedOrderId
      });
    } catch (error) {
      console.error('Error syncing with URL:', error);
    }
  }
});

// Create the store with proper typing for the middleware
export const useOrdersStore = create<
  OrdersState,
  [['zustand/subscribeWithSelector', never]]
>(subscribeWithSelector(createOrdersStore));