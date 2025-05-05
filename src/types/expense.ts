import { expenseCategoryTypeSchema, orderExpenseStatusTypes, orderExpenseStatusTypesSchema, sackSizeTypeSchema, zohoTaxTypeSchema } from "@/server/db/schema";
import { DateRange } from "react-day-picker";
import { z } from "zod";

export const ExpenseFilterFields = z.enum([ 'orderNumber', 'customerId', 'expenseItemName', 'expenseItemCategory', 'status' ])
export type ExpenseFilterFieldsType = z.infer<typeof ExpenseFilterFields>

export const statusOptions = [ '', 'PENDING', 'DONE', 'CANCELLED' ] as const;
// Derive the StatusType union from the options
export type StatusType = typeof statusOptions[ number ]; // '' | 'PENDING' | 'DONE'


export interface ExpenseFilters {
    orderNumber?: string
    customerId?: string;
    dateRange?: {
        from: Date;
        to: Date;
    } | DateRange
    expenseItemName?: string
    expenseItemCategory?: string
    status?: StatusType
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
    defaultExpensePrice: z.coerce.number().nonnegative(),
    expenseCategory: expenseCategoryTypeSchema.nullable(),
    notes: z.string().optional().nullable(),
    createdBy: z.string().uuid().optional(),
    createdAt: z.date(),
    updatedAt: z.date().nullable(),

    zohoItemId: z.string().optional().nullable(),
    zohoTaxId: zohoTaxTypeSchema.optional().nullable()
})
export type selectExpenseSchemaType = z.infer<typeof expenseItemsSchema>

export const createExpenseItemsSchema = z.array(expenseItemsSchema.omit({
    expenseItemId: true,
    createdAt: true,
    updatedAt: true,
}))

// EXPENSES RELATING TO ORDERS
export const orderExpenseSchema = z.object({
    orderExpenseId: z.string().uuid(),
    orderId: z.string(),
    expenseItemId: z.string().uuid(),
    expenseItemPrice: z.coerce.number().nonnegative(),
    expenseItemQuantity: z.number(),
    status: orderExpenseStatusTypesSchema.optional(),
    notes: z.string().optional().nullish(),
    createdBy: z.string().uuid(),
    createdAt: z.coerce.date().optional(),
    updatedAt: z.coerce.date().nullish()
})
export type orderExpenseSchemaType = z.infer<typeof orderExpenseSchema>

export const EnrichedOrderExpenseSchema = orderExpenseSchema.extend({
    expenseItemName: z.string(),
    expenseItemCategory: expenseCategoryTypeSchema.nullable(),
    orderNumber: z.number().optional(),
    customerId: z.string().uuid().optional(),
    customerName: z.string().optional(),

})
export type EnrichedOrderExpenseSchemaType = z.infer<typeof EnrichedOrderExpenseSchema>

export const orderExpenseWithName = orderExpenseSchema.extend({
    expenseName: z.string(),
    expenseItemPrice: z.number().nonnegative(),
})
export type orderExpenseWithNameType = z.infer<typeof orderExpenseWithName>

export const sackSizeTrackerSchema = z.object({
    id: z.string().optional(),
    orderExpensesId: z.string().optional(),
    sackType: sackSizeTypeSchema,
    amount: z.number(),
    createdBy: z.string(),
    createdAt: z.coerce.date().optional(),
    updatedAt: z.coerce.date().nullish(),
})

export const createOrderExpenseWithSackSizeTrackerSchema = z.object({
    orderExpenseId: z.string().uuid().optional().nullish(),
    orderId: z.string(),
    expenseItemId: z.string().uuid(),
    expenseItemPrice: z.coerce.number().nonnegative(),
    expenseItemQuantity: z.number(),
    status: orderExpenseStatusTypesSchema.optional(),
    notes: z.string().optional().nullish(),
    sackSizes: z.array(sackSizeTrackerSchema).nullish(),
    createdBy: z.string().uuid(),
    createdAt: z.coerce.date().optional(),
    updatedAt: z.coerce.date().nullish()
})

export const createOrderExpenseSchema = z.array(createOrderExpenseWithSackSizeTrackerSchema.omit({
    // orderExpenseId: true,
    createdAt: true,
    updatedAt: true,
    status: true
}))
export type createOrderExpenseSchemaType = z.infer<typeof createOrderExpenseSchema>






