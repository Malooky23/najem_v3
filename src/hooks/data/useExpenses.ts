'use client'

import { fetchExpensesList, fetchExpensesListDB } from "@/server/queries/expense-queries";
import { selectExpenseSchemaType } from "@/types/expense";
import { useQuery } from "@tanstack/react-query";

export function useExpenseItems() {
    return useQuery<selectExpenseSchemaType[]>({
        queryKey: [ "expenseItems" ],
        queryFn: async (): Promise<selectExpenseSchemaType[]> => {
            return fetchExpensesListDB()
        },
        staleTime: 50 * 600 * 1000,
    });
}

// --- Data Fetching ---


