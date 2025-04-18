'use server'

import { EnrichedOrderExpenseSchema, EnrichedOrderExpenseSchemaType, expenseItemsSchema, selectExpenseSchemaType } from "@/types/expense"
import { db } from "@/server/db"
import { z } from "zod"
import { enrichedOrderExpenseView } from '@/server/db/schema'
import { eq, and } from "drizzle-orm"
import { orders } from "../drizzle/schema"

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
export async function DBfetchExpenses(): Promise<EnrichedOrderExpenseSchemaType[]> {
    try {
        const whereConditions = []
        whereConditions.push(eq(enrichedOrderExpenseView.orderNumber, 38))
        const rawData = await db.select().from(enrichedOrderExpenseView).where(and(...whereConditions))

        const parse = z.array(EnrichedOrderExpenseSchema).parse(rawData)
        return parse;
        // return rawData;
        
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

