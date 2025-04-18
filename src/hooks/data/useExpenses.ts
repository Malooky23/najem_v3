'use client'

import { DBfetchExpenseItemsList } from "@/server/DB-Queries/expense-queries";
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
    pageSize = 20, // Default page size
    filters = {},
    sort = { field: 'createdAt', direction: 'desc' }, // Default sort

}: UseExpensesParams = {}) {

    const queryKey = [ 'orderExpenses', page, pageSize, filters, sort ];
    return useQuery({
        queryKey: queryKey,
        queryFn: async () =>  {
            const response = await getOrderExpenses(page, pageSize, filters, sort)
            if(!response.success){
                throw new Error(response.error?? "An Error occurred while fetching expenses. E483")
            }
            return response
        },
        staleTime: 10 * 60 * 1000, // 10 minutes
        gcTime: 10 * 60 * 1000, // 10 minutes
        placeholderData: keepPreviousData, // Keep previous data while fetching new page/filters
        refetchOnWindowFocus: false, // Optional: Adjust as needed
    });
}



