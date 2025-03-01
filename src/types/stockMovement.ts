import { m } from "motion/react";
import { custom, z } from "zod";

export type StockMovementSortFields =
    | 'createdAt'
    | 'movementType'
    | 'quantity'
    | 'itemName'
    | 'customerDisplayName'
    | 'stockLevelAfter'
    | 'movementNumber';
export const movementType = z.enum(['IN', 'OUT']);
export type MovementType = z.infer<typeof movementType>;

export interface StockMovementSort {
    field: StockMovementSortFields;
    direction: 'asc' | 'desc';
}
export interface StockMovementFilters {
    customerId?: string;
    itemName?: string;
    dateRange?: {
        from: Date;
        to: Date;
    };
    movement?: MovementType;
    search?: string;
}

export const stockReconciliation = z.object({
    reconciliationId: z.string(),
    itemId: z.string(),
    locationId: z.string(),
    expectedQuantity: z.number(),
    actualQuantity: z.number(),
    discrepancy: z.number(),
    notes: z.string().nullable(),
    reconciliationDate: z.date(),
    performedBy: z.string(),
    createdAt: z.date(),
});
export const stockMovement = z.object({
    movementId: z.string(),
    movementNumber: z.coerce.number(),
    itemId: z.string(),
    locationId: z.string(),
    movementType: z.enum(["IN", "OUT"]),
    quantity: z.number(),
    referenceType: z.string().nullable(),
    referenceId: z.string().nullable(),
    notes: z.string().nullable(),
    createdBy: z.string().nullable(),
    createdAt: z.date(),
});
export const stockMovementsView = stockMovement.extend({
    itemName: z.string(),
    customerId: z.string(),
    customerDisplayName: z.string(),
    stockLevelAfter: z.coerce.number(),
});

export type StockMovementTable = z.infer<typeof stockMovement>
export type EnrichedStockMovementView = z.infer<typeof stockMovementsView>

