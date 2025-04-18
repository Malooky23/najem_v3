import { expenseCategoryTypeSchema, orderExpenseStatusTypes, orderExpenseStatusTypesSchema } from "@/server/db/schema";
import { z } from "zod";


export interface ExpenseFilters {
    orderNumber?: string
    customerId?: string;
    dateRange?: {
        from: Date;
        to: Date;
    };
    expenseItemName?: string
    expenseItemCategory?: string
    search?: string;
}

export type ExpenseSortFields = 'orderNumber' | 'createdAt' | 'customerName' | 'status';

export interface ExpenseSort {
    field: ExpenseSortFields;
    direction: 'asc' | 'desc';
}

export interface UseExpensesParams {
    page?: number;
    pageSize?: number;
    filters?: ExpenseFilters;
    sort?: ExpenseSort;

}


// LIST OF AVAILABLE EXPENSES
export const expenseItemsSchema = z.object({
    expenseItemId: z.string().uuid(),
    expenseName: z.string(),
    expensePrice: z.coerce.number().nonnegative(),
    expenseCategory: expenseCategoryTypeSchema.nullable(),
    notes: z.string().optional().nullable(),
    createdBy: z.string().uuid().optional(),
    createdAt: z.date(),
    updatedAt: z.date().nullable()
})
export type selectExpenseSchemaType = z.infer<typeof expenseItemsSchema>

export const createExpenseItemsSchema = z.array(expenseItemsSchema.omit({
    expenseItemId: true,
    createdAt: true,
    updatedAt: true,
}))

// EXPENSES RELATING TO ORDERS
export const orderExpenseSchema = z.object({
    orderExpenseId: z.string().uuid().optional(),
    orderId: z.string().uuid(),
    expenseItemId: z.string().uuid(),
    expenseItemQuantity: z.number(),
    status: orderExpenseStatusTypesSchema,
    notes: z.string().optional().nullish(),
    createdBy: z.string().uuid(),
    createdAt: z.coerce.date(),
    updatedAt: z.coerce.date().nullish()
})
export type orderExpenseSchemaType = z.infer<typeof orderExpenseSchema>

export const EnrichedOrderExpenseSchema = orderExpenseSchema.extend({
    expenseItemName: z.string(),
    expenseItemPrice: z.coerce.number().nonnegative(),
    expenseItemCategory: expenseCategoryTypeSchema.nullable(),
    orderNumber: z.number().optional(),
    customerId: z.string().uuid().optional(),
    customerName: z.string().optional(),

})
export type EnrichedOrderExpenseSchemaType = z.infer<typeof EnrichedOrderExpenseSchema>

export const orderExpenseWithName = orderExpenseSchema.extend({
    expenseName: z.string(),
    expensePrice: z.number().nonnegative(),
})
export type orderExpenseWithNameType = z.infer<typeof orderExpenseWithName>

export const createOrderExpenseSchema = z.array(orderExpenseSchema.omit({
    // orderExpenseId: true,
    createdAt: true,
    updatedAt: true,
    status:true
}))
export type createOrderExpenseSchemaType = z.infer<typeof createOrderExpenseSchema>






