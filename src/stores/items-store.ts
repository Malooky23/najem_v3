import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { StateCreator } from 'zustand';

interface ItemsState {
  // UI State
  selectedItemId: string | null;
  isDetailsOpen: boolean;
  
  // Actions
  selectItem: (id: string | null) => void;
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
});

export const useItemsStore = create<
  ItemsState,
  [['zustand/subscribeWithSelector', never]]
>(subscribeWithSelector(createItemsStore));