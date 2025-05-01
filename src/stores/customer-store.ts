import { create } from 'zustand';
import { AddressDetails, ContactDetails, Customer, IndividualCustomer, BusinessCustomer } from '@/server/db/schema';
import { EnrichedCustomer } from '@/types/customer';

// Define a type for the enriched customer data you expect to fetch
// export interface EnrichedCustomerData extends Customer {
//     individual?: IndividualCustomer | null;
//     business?: BusinessCustomer | null;
//     addresses?: (AddressDetails & { entityAddressId: string })[]; // Include join table ID if needed
//     contacts?: (ContactDetails & { entityContactId: string })[]; // Include join table ID if needed
//     // Add other related data as needed (e.g., users, items)
// }

interface CustomerState {
    selectedCustomerId: string | null;
    selectedCustomerData: EnrichedCustomer | null;
    selectCustomer: (customerId: string | null, customerData: EnrichedCustomer | null) => void;
    updateSelectedCustomerData: (updatedData: Partial<EnrichedCustomer>) => void;
    // Add specific update functions if needed, e.g., updateStatus, addAddress, etc.

    isDetailsOpen: boolean;
    closeDetails: () => void;


}

export const useCustomersStore = create<CustomerState>((set) => ({
    selectedCustomerId: null,
    selectedCustomerData: null,

    selectCustomer: (customerId, customerData) => set({
        selectedCustomerId: customerId,
        selectedCustomerData: customerData,
        isDetailsOpen: !!customerId

    }),

    updateSelectedCustomerData: (updatedData) => set((state) => {
        if (!state.selectedCustomerData) return {}; // No customer selected, do nothing
        return {
            selectedCustomerData: {
                ...state.selectedCustomerData,
                ...updatedData,
                // Deep merge related arrays if necessary, or replace them
                // Example: If updating addresses, decide whether to merge or replace
                // addresses: updatedData.addresses ? mergeOrReplace(state.selectedCustomerData.addresses, updatedData.addresses) : state.selectedCustomerData.addresses,
            },
        };
    }),

    // Example specific updater (if needed later)
    // updateCustomerStatus: (newStatus) => set((state) => {
    //   if (!state.selectedCustomerData) return {};
    //   return { selectedCustomerData: { ...state.selectedCustomerData, status: newStatus } };
    // }),

    isDetailsOpen: false,
    closeDetails: () => set({
        selectedCustomerId: null,
        selectedCustomerData: null,
        isDetailsOpen: false
    }),

}));

// --- Hooks for easy access ---
export const useSelectedCustomerId = () => useCustomersStore((state) => state.selectedCustomerId);
export const useSelectedCustomerData = () => useCustomersStore((state) => state.selectedCustomerData);