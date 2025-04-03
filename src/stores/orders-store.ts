import { create } from 'zustand';
import { OrderFilters, OrderSort, OrderSortField, EnrichedOrders } from '@/types/orders';
import { subscribeWithSelector } from 'zustand/middleware';
import { StateCreator } from 'zustand';
import {orderStatusSchema, movementTypeSchema} from '@/server/db/schema';
import { z } from 'zod';

type OrderStatus = z.infer<typeof orderStatusSchema>;
type MovementType = z.infer<typeof movementTypeSchema>;
// Simpler state interface with focused responsibilities
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

  // UI State - simplified
  selectedOrderId: string | null;
  selectedOrderData: EnrichedOrders | null;
  isDetailsOpen: boolean;
  isLoading: boolean;

  // Core actions only
  setPage: (page: number) => void;
  setPageSize: (size: number) => void;
  setSort: (field: OrderSortField, direction: 'asc' | 'desc') => void;
  setStatus: (status: OrderStatus | null) => void;
  setCustomerId: (id: string | null) => void;
  setMovement: (movement: MovementType | null) => void;
  setDateRange: (from: string | null, to: string | null) => void;
  selectOrder: (id: string | null, data?: EnrichedOrders | null) => void;
  updateSelectedOrderStatus: (status: OrderStatus) => void;
  clearFilters: () => void;
  setLoading: (isLoading: boolean) => void;

  // Derived state
  getFilters: () => OrderFilters;
  getSort: () => OrderSort;
  syncWithUrl: (searchParams: URLSearchParams) => void;
}

type StoreWithSubscribe = StateCreator<
  OrdersState,
  [['zustand/subscribeWithSelector', never]],
  [],
  OrdersState
>;

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
  selectedOrderData: null,
  isDetailsOpen: false,
  isLoading: false,

  // Actions
  setPage: (page) => {
    if (get().page !== page) set({ page });
  },

  setPageSize: (pageSize) => {
    if (get().pageSize !== pageSize) set({ pageSize, page: 1 });
  },

  setSort: (sortField, sortDirection) => {
    if (get().sortField !== sortField || get().sortDirection !== sortDirection) {
      set({ sortField, sortDirection, page: 1 });
    }
  },

  setStatus: (status) => {
    if (get().status !== status) set({ status, page: 1 });
  },

  setCustomerId: (customerId) => {
    if (get().customerId !== customerId) set({ customerId, page: 1 });
  },

  setMovement: (movement) => {
    if (get().movement !== movement) set({ movement, page: 1 });
  },

  setDateRange: (dateFrom, dateTo) => {
    if (get().dateFrom !== dateFrom || get().dateTo !== dateTo) {
      set({ dateFrom, dateTo, page: 1 });
    }
  },

  // Simplified order selection
  selectOrder: (id, data = null) => {
    const prevId = get().selectedOrderId;
    if (prevId !== id) {
      set({ 
        selectedOrderId: id,
        isDetailsOpen: !!id,
        selectedOrderData: id ? data : null
      });
    } else if (data && id) {
      // Update data if same ID but new data
      set({ selectedOrderData: data });
    }
  },

  updateSelectedOrderStatus: (status) => {
    const currentData = get().selectedOrderData;
    if (currentData) {
      set({ 
        selectedOrderData: {
          ...currentData,
          status
        }
      });
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
    if (get().isLoading !== isLoading) set({ isLoading });
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

// Create the store
export const useOrdersStore = create<
  OrdersState,
  [['zustand/subscribeWithSelector', never]]
>(subscribeWithSelector(createOrdersStore));

// Simple individual selectors to avoid object recreation and infinite loops
export const useSelectedOrderId = () => useOrdersStore(state => state.selectedOrderId);
export const useSelectedOrderData = () => useOrdersStore(state => state.selectedOrderData);
export const useOrdersLoading = () => useOrdersStore(state => state.isLoading);