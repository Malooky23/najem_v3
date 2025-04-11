import { z } from 'zod';
import { addressDetails, items, orderItems, orders, userType, userTypeSchema } from '@/server/db/schema';
import { ItemSchema } from './items';
import { orderTypeSchema, orderStatusSchema, movementTypeSchema, deliveryMethodSchema, packingTypeSchema } from '@/server/db/schema';
import { createInsertSchema, createSelectSchema, createUpdateSchema } from 'drizzle-zod';
import { uuid } from 'drizzle-orm/pg-core';
import { orderExpenseSchema } from './expense';
// Enums for order status and types





// Base types from database schema
// export type Order = typeof orders.$inferSelect;
export type InsertOrder = typeof orders.$inferInsert;

export type OrderItem = typeof orderItems.$inferSelect;
export type InsertOrderItem = typeof orderItems.$inferInsert;

export const OrderTable = z.object({
    orderId: z.string().uuid(),
    orderNumber: z.number().positive(),
    customerId: z.string().uuid(),
    orderType: orderTypeSchema,
    movement: movementTypeSchema,
    packingType: packingTypeSchema,
    deliveryMethod: deliveryMethodSchema,
    status: orderStatusSchema,
    addressId: z.string().uuid().nullable(),
    fulfilledAt: z.date().nullable().nullish().optional(),
    notes: z.string().nullable(),
    orderMark: z.string().max(20,"Mark too long, Max 20 characters.").nullable().optional(),
    createdBy: z.string(),
    createdAt: z.date(),
    updatedAt: z.date().nullable().nullish().optional(),
    isDeleted: z.boolean().default(false),
});

export const EnrichedOrders = OrderTable.extend({
    customerName: z.string(),
    creator: z.object({
        userId: z.string().uuid(),
        firstName: z.string(),
        lastName: z.string(),
        userType: userTypeSchema,
    }),
    items: z.array(
        z.object({
            itemId: z.string().uuid(),
            itemName: z.string(),
            quantity: z.number().positive(),
            itemLocationId: z.string().uuid()
        }))
        // })).min(1, 'At least one item is required'),
});
export type EnrichedOrders = z.infer<typeof EnrichedOrders>;

// Validation schemas
export const createOrderSchema = z.object({
    customerId: z.string().uuid(),
    orderType: orderTypeSchema.default('CUSTOMER_ORDER'),
    movement: movementTypeSchema,
    packingType: packingTypeSchema.default('NONE'),
    deliveryMethod: deliveryMethodSchema.default('NONE'),
    status: orderStatusSchema.default('PENDING'),
    addressId: z.string().uuid().optional().nullable(),
    notes: z.string().optional().nullable(),
    orderMark: z.string().max(20,"Mark too long, Max 20 characters.").optional().nullable(),
    items: z.array(
             z.object({
                itemId: z.string().uuid(),
                quantity: z.number().positive(),
                itemLocationId: z.string().uuid()
            })
        ).min(1, 'At least one item is required'),
    createdBy: z.string().uuid()
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;

export const updateOrderSchema = createOrderSchema.partial().extend({
    orderId: z.string().uuid(),
});

export type UpdateOrderInput = z.infer<typeof updateOrderSchema>;

// Filter and sort types
export interface OrderFilters {
    status?: z.infer<typeof orderStatusSchema>;
    customerId?: string;
    dateRange?: {
        from: Date;
        to: Date;
    };
    movement?: z.infer<typeof movementTypeSchema>;
    search?: string;
}

export type OrderSortField = 'orderNumber' | 'createdAt' | 'status' | 'customerName';

export interface OrderSort {
    field: OrderSortField;
    direction: 'asc' | 'desc';
}

/////////////////////// New Order Types using zod implementation with drizzle

export const OrderSchema = createSelectSchema(orders)
export type OrderSchemaType = z.infer<typeof OrderSchema>

export const CreateOrderSchemaWithoutItems = createInsertSchema(orders)
export const CreateOrderSchema = CreateOrderSchemaWithoutItems.extend({
    items: z.array(
        z.object({
            itemId: z.string().uuid(),
            quantity: z.number().positive(),
            itemLocationId: z.string().uuid()
        })
    ).min(1, 'At least one item is required')
})
export type CreateOrderSchemaType = z.infer<typeof CreateOrderSchema>

export const UpdateOrderSchemaWithoutItems = createUpdateSchema(orders,{
    orderId: z.string().uuid()
})
export const UpdateOrderSchema = UpdateOrderSchemaWithoutItems.extend({
    items: z.array(
        z.object({
            itemId: z.string().uuid(),
            quantity: z.number().positive(),
            itemLocationId: z.string().uuid()
        })
    ).min(1, 'At least one item is required')
})
export type UpdateOrderSchemaType = z.infer<typeof UpdateOrderSchema>

export const EnrichedOrderSchema = OrderSchema.extend({
    customerName: z.string(),
    creator: z.object({
        userId: z.string().uuid(),
        firstName: z.string(),
        lastName: z.string(),
        userType: userTypeSchema,
    }),
    items: z.array(
        z.object({
            itemId: z.string().uuid(),
            itemName: z.string(),
            quantity: z.number().positive(),
            itemLocationId: z.string().uuid()
        })),
    expenses: z.array(orderExpenseSchema).optional()
});
export type EnrichedOrderSchemaType = z.infer<typeof EnrichedOrderSchema>;
