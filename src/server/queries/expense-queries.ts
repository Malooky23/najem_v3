'use server'

import { expenseItemsSchema, selectExpenseSchemaType } from "@/types/expense"
import { db } from "../db"
import { expenseItems } from "../db/schema"
import { z } from "zod"


export async function fetchExpensesList() {

    const data = await db.query.expenseItems.findMany()
    const expenseItemsSchemaArray = z.array(expenseItemsSchema)
    const validate = expenseItemsSchemaArray.safeParse(data)
    if (validate.success){
        return validate.data
    }
    else{
        return []
    }

}

export async function fetchExpensesListDB(): Promise<selectExpenseSchemaType[]> {
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