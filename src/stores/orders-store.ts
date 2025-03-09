import { create } from 'zustand';

interface OrdersState {
  isDetailsOpen: boolean;
  selectedOrderId: string | null;
  setIsDetailsOpen: (isOpen: boolean) => void;
  setSelectedOrderId: (orderId: string | null) => void;
}

export const useOrdersStore = create<OrdersState>((set) => ({
  isDetailsOpen: false,
  selectedOrderId: null,
  setIsDetailsOpen: (isOpen) => set({ isDetailsOpen: isOpen }),
  setSelectedOrderId: (orderId) => set({ selectedOrderId: orderId }),
}));