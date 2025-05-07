import { keepPreviousData, useQuery } from '@tanstack/react-query';
// import { getCustomerById } from '@/server/actions/customers'; // Assuming you create this action
import { getSingleCustomer } from '@/server/services/customer-services';
import { EnrichedCustomer } from '@/types/customer';
import { fetchCustomers } from "@/server/DB-Queries/customers-queries";

export const useCustomerByIdQuery = (customerId: string | null) => {
    return useQuery<EnrichedCustomer, Error>({ // Specify return type and error type
        queryKey: [ 'customer', customerId ], // Unique query key
        queryFn: async () => {
            if (!customerId) {
                // Return null or throw an error if customerId is null/undefined
                // Tanstack Query v5 handles this better, but explicit check is safe
                // Returning null might be preferable if you want the query to be 'inactive'
                // Throwing ensures it goes into error state if called improperly
                throw new Error("Customer ID is required");
                // return null; // Or return null if you prefer inactive state
            }
            return await getSingleCustomer(customerId);
            
            // const result = await getCustomerById(customerId);
            // if (!result.success || !result.data) {
            //     throw new Error(result.error?.message || 'Failed to fetch customer data');
            // }
            // return result.data;
        },
        enabled: !!customerId, // Only run the query if customerId is truthy
        staleTime: 5 * 60 * 1000, // 5 minutes
        // Add other react-query options as needed (refetchOnWindowFocus, etc.)
    });
};

export function useCustomers(enabled: boolean = true) {
    return useQuery<EnrichedCustomer[]>({
        queryKey: [ 'customers' ],
        queryFn: async () => {
            return await fetchCustomers()
        },
        refetchOnMount: false,
        refetchOnWindowFocus: false,
        staleTime: 100 * 100 * 100 * 100,
        placeholderData: keepPreviousData,
        enabled: enabled
    });
}