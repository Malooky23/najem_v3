'use client'

import { DBfetchExpenseItemsList, DBfetchExpensesByOrderExpenseIds, DBSearchExpensesParams } from "@/server/DB-Queries/expense-queries";
import { getOrderExpenses } from "@/server/services/service.expenses";
import { selectExpenseSchemaType, UseExpensesParams } from "@/types/expense";
import { keepPreviousData, useQuery } from "@tanstack/react-query";

export function useExpenseItems() {
    return useQuery<selectExpenseSchemaType[]>({
        queryKey: [ "expenseItems" ],
        queryFn: async (): Promise<selectExpenseSchemaType[]> => {
            return DBfetchExpenseItemsList()
        },
        staleTime: 50 * 600 * 1000,
    });
}

export function useOrderExpenses({
    page = 1,
    pageSize = 20,
    filters = {},
    sort = { field: 'createdAt', direction: 'desc' },
}: UseExpensesParams = {}) { // Accept parameters object

    // Construct a stable query key using primitive values from the destructured params
    // IMPORTANT: Ensure this uses the debounced search value passed in via filters.search
    const queryKey = [
        'orderExpenses',
        {
            page,
            pageSize,
            // Destructure filters to ensure key stability
            search: filters?.search, // This should be the debounced value from the caller
            status: filters?.status,
            dateFrom: filters?.dateRange?.from && new Date(filters?.dateRange?.from),
            dateTo: filters?.dateRange?.to && new Date(filters?.dateRange?.to),
            customerId: filters?.customerId,
            orderNumber: filters?.orderNumber,
            expenseItemName: filters?.expenseItemName,
            expenseItemCategory: filters?.expenseItemCategory,
            // Add other specific filter values here if they exist
            // Destructure sort
            sortField: sort?.field,
            sortDirection: sort?.direction,
        }
    ];

    return useQuery({
        queryKey: queryKey, // Use the stable key
        queryFn: async () => {
            // Pass the original params object to the actual fetch function
            const response = await getOrderExpenses(page, pageSize, filters, sort)
            if (!response.success) {
                throw new Error(response.error ?? "An Error occurred while fetching expenses. E483")
            }
            return response
        },
        staleTime: 10 * 60 * 1000,
        gcTime: 10 * 60 * 1000,
        placeholderData: keepPreviousData,
        refetchOnWindowFocus: false,
    });
}


export function useSearchOrderExpenses(expenseIds: DBSearchExpensesParams, options: {enabled: boolean}) {
    return useQuery({
        queryKey: [ "expenseItems", expenseIds ],
        queryFn: async () => {
            const response = await DBfetchExpensesByOrderExpenseIds(expenseIds)
            if (response.success) {
                return response.data
            }
            throw new Error(response.message ?? "An Error occurred while fetching expenses. E4322")
        },
        enabled: options.enabled,
        staleTime: 50 * 600 * 1000,
    });
}

