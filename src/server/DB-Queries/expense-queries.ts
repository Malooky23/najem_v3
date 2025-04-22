'use server'

import { EnrichedOrderExpenseSchema, EnrichedOrderExpenseSchemaType, expenseItemsSchema, selectExpenseSchemaType } from "@/types/expense"
import { db } from "@/server/db"
import { z } from "zod"
import { enrichedOrderExpenseView } from '@/server/db/schema'
import { eq, and, inArray, desc } from "drizzle-orm"
import { orders } from "../drizzle/schema"
import { ApiResponse } from "@/types/common"

export async function DBfetchExpenseItemsList(): Promise<selectExpenseSchemaType[]> {
    try {
        const rawData = await db.query.expenseItems.findMany()
        const expenseItemsSchemaArray = z.array(expenseItemsSchema)
        const parse = expenseItemsSchemaArray.safeParse(rawData)
        if (!parse.success) {
            console.error("Data validation error:", JSON.stringify(parse.error.issues, null, 2));
            throw new Error("Invalid expense Items data structure received from database");
        }
        return parse.data;
    } catch (error) {
        if (error instanceof Error) {
            console.error("Error fetching expense Items:", error.message);
            throw new Error("Failed to fetch expense Items");
        } else {
            console.error("An unexpected error occurred:", error);
            throw new Error("Failed to fetch expense Items");
        }
    }
};


export type DBSearchExpensesParams = {
    orderExpenseIds?: string[]
    customerId?: string
}

export async function DBfetchExpensesByOrderExpenseIds(searchParams: DBSearchExpensesParams): Promise<ApiResponse<EnrichedOrderExpenseSchemaType[]>> {
    try {
        let rawData;

        if (searchParams.orderExpenseIds) {
            rawData = await db.select().from(enrichedOrderExpenseView)
                .where(inArray(enrichedOrderExpenseView.orderExpenseId, searchParams.orderExpenseIds))
                .orderBy(enrichedOrderExpenseView.createdAt);
        } else if (searchParams.customerId) {
            rawData = await db.select().from(enrichedOrderExpenseView)
                .where(eq(enrichedOrderExpenseView.customerId, searchParams.customerId))
                .orderBy(enrichedOrderExpenseView.createdAt);
        } else {
            return { success: true, data: [] }; // Return empty array if no search params are provided
        }

        console.log(rawData);
        const parse = z.array(EnrichedOrderExpenseSchema).safeParse(rawData)
        if (!parse.success) {
            console.error("Data validation error");
            return { success: false, message: "Invalid expense Items data structure received from database" }
        }
        return { success: true, data: parse.data }

    } catch (error) {
        if (error instanceof Error) {
            console.error("Error fetching expense Items:", error.message);
            throw new Error("Failed to fetch expense Items");
        } else {
            console.error("An unexpected error occurred:", error);
            throw new Error("Failed to fetch expense Items");
        }
    }
};
