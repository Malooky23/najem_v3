import { create } from 'zustand';
import { StockMovementFilters, StockMovementSort, StockMovementSortFields, MovementType } from '@/types/stockMovement';
import { subscribeWithSelector } from 'zustand/middleware';
import { StateCreator } from 'zustand';

interface StockMovementState {
  // Pagination
  page: number;
  pageSize: number;

  // Sorting
  sortField: StockMovementSortFields;
  sortDirection: 'asc' | 'desc';

  // Filters
  search: string | null;
  movement: MovementType | null;
  itemName: string | null;
  customerDisplayName: string | null;
  dateFrom: string | null;
  dateTo: string | null;

  // UI State
  selectedMovementId: string | null;
  isDetailsOpen: boolean;
  isLoading: boolean;

  // Actions
  setPage: (page: number) => void;
  setPageSize: (size: number) => void;
  setSort: (field: StockMovementSortFields, direction: 'asc' | 'desc') => void;
  setSearch: (search: string | null) => void;
  setMovement: (movement: MovementType | null) => void;
  setItemName: (name: string | null) => void;
  setCustomerName: (name: string | null) => void;
  setDateRange: (from: string | null, to: string | null) => void;
  selectMovement: (id: string | null) => void;
  clearFilters: () => void;
  setLoading: (isLoading: boolean) => void;

  // Derived state
  getFilters: () => StockMovementFilters;
  getSort: () => StockMovementSort;
  syncWithUrl: (searchParams: URLSearchParams) => void;
}

// Correctly define the middleware type
type StoreWithSubscribe = StateCreator<
  StockMovementState,
  [['zustand/subscribeWithSelector', never]],
  [],
  StockMovementState
>;

// Create the store implementation with correct typing
const createStockMovementStore: StoreWithSubscribe = (set, get) => ({
  // Default state
  page: 1,
  pageSize: 50,
  sortField: 'createdAt',
  sortDirection: 'desc',
  search: null,
  movement: null,
  itemName: null,
  customerDisplayName: null,
  dateFrom: null,
  dateTo: null,
  selectedMovementId: null,
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

  setSearch: (search) => {
    const normalizedSearch = search === '' ? null : search;
    const prevSearch = get().search;
    if (prevSearch !== normalizedSearch) {
      set({ search: normalizedSearch, page: 1 });
    }
  },

  setMovement: (movement) => {
    const prevMovement = get().movement;
    if (prevMovement !== movement) {
      set({ movement, page: 1 });
    }
  },

  setItemName: (itemName) => {
    const prevItemName = get().itemName;
    if (prevItemName !== itemName) {
      set({ itemName, page: 1 });
    }
  },

  setCustomerName: (customerDisplayName) => {
    const prevCustomerName = get().customerDisplayName;
    if (prevCustomerName !== customerDisplayName) {
      set({ customerDisplayName, page: 1 });
    }
  },

  setDateRange: (dateFrom, dateTo) => {
    const prevDateFrom = get().dateFrom;
    const prevDateTo = get().dateTo;
    if (prevDateFrom !== dateFrom || prevDateTo !== dateTo) {
      set({ dateFrom, dateTo, page: 1 });
    }
  },

  selectMovement: (id) => {
    const prevId = get().selectedMovementId;
    if (prevId !== id) {
      set({ selectedMovementId: id, isDetailsOpen: !!id });
    }
  },

  clearFilters: () => {
    set({
      search: null,
      movement: null,
      itemName: null,
      customerDisplayName: null,
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
    const { search, movement, itemName, customerDisplayName, dateFrom, dateTo } = get();
    const filters: StockMovementFilters = {};

    if (search !== null && search !== undefined && search !== '') {
      filters.search = search.trim();
    }

    if (movement) filters.movement = movement;
    if (itemName) filters.itemName = itemName;
    if (customerDisplayName) filters.customerDisplayName = customerDisplayName;

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
      const pageSize = Number(searchParams.get('pageSize')) || 20;
      const sortField = (searchParams.get('sort') || 'createdAt') as StockMovementSortFields;
      const sortDirection = (searchParams.get('direction') || 'desc') as 'asc' | 'desc';
      const search = searchParams.get('search');
      const movement = searchParams.get('movement') as MovementType | null;
      const itemName = searchParams.get('itemName');
      const customerDisplayName = searchParams.get('customerDisplayName');
      const dateFrom = searchParams.get('dateFrom');
      const dateTo = searchParams.get('dateTo');
      const selectedMovementId = searchParams.get('movementId');

      set({
        page,
        pageSize,
        sortField,
        sortDirection,
        search,
        movement,
        itemName,
        customerDisplayName,
        dateFrom,
        dateTo,
        selectedMovementId,
        isDetailsOpen: !!selectedMovementId
      });
    } catch (error) {
      console.error('Error syncing with URL:', error);
    }
  }
});

// Create the store with proper typing for the middleware
export const useStockMovementStore = create<
  StockMovementState,
  [['zustand/subscribeWithSelector', never]]
>(subscribeWithSelector(createStockMovementStore));
