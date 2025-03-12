import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { StateCreator } from 'zustand';
import { is } from 'drizzle-orm';

interface ItemsState {
  // UI State
  selectedItemId: string | null;
  isDetailsOpen: boolean;
  
  // Actions
  selectItem: (id: string | null) => void;
  closeDetails: () => void;

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
  
  // Actions
  selectItem: (id) => set({ 
    selectedItemId: id,
    isDetailsOpen: !!id 
  }),
  
  closeDetails: () => set({ 
    selectedItemId: null,
    isDetailsOpen: false 
  }),
});

export const useItemsStore = create<
  ItemsState,
  [['zustand/subscribeWithSelector', never]]
>(subscribeWithSelector(createItemsStore));