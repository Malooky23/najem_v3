import { expenseCategoryTypeSchema} from "@/server/db/schema";
import { z } from "zod";

// LIST OF AVAILABLE EXPENSES
export const expenseItemsSchema = z.object({
    expenseItemId: z.string().uuid(),
    expenseName: z.string(),
    expensePrice: z.number().nonnegative(),
    expenseCategory: expenseCategoryTypeSchema.optional(),
    notes: z.string().optional(),
    createdBy: z.string().uuid().optional(),
    createdAt: z.string().datetime().optional(),
    updatedAt: z.string().datetime().optional()
})
export type selectExpenseSchemaType = z.infer<typeof expenseItemsSchema>

export const createExpenseItemsSchema = z.array(expenseItemsSchema.omit({
    expenseItemId: true,
    createdAt: true,
    updatedAt: true
}))

// EXPENSES RELATING TO ORDERS
export const orderExpenseSchema = z.object({
    orderExpenseId: z.string().uuid().optional(),
    orderId: z.string().uuid(),
    expenseItemId: z.string().uuid(),
    expenseItemQuantity: z.number(),
    notes: z.string().optional().nullish(),
    createdBy: z.string().uuid(),
    createdAt: z.coerce.date(),
    updatedAt: z.coerce.date().nullish()
})
export type orderExpenseSchemaType = z.infer<typeof orderExpenseSchema>

export const orderExpenseWithName = orderExpenseSchema.extend({
    expenseName: z.string(),
    expensePrice: z.number().nonnegative(),
})
export type orderExpenseWithNameType = z.infer<typeof orderExpenseWithName>



export const createOrderExpenseSchema = z.array(orderExpenseSchema.omit({
    // orderExpenseId: true,
    createdAt: true,
    updatedAt: true
}))
export type createOrderExpenseSchemaType = z.infer<typeof createOrderExpenseSchema>






