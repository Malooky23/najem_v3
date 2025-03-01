import { z } from 'zod';
import { type orders, addressDetails, items, orderItems, userType } from '@/server/db/schema';
import { ItemSchema } from './items';

// Enums for order status and types
export const orderStatus = z.enum(['DRAFT', 'PENDING', 'PROCESSING', 'READY', 'COMPLETED', 'CANCELLED']);
export type OrderStatus = z.infer<typeof orderStatus>;

export const orderType = z.enum(['CUSTOMER_ORDER']);
export type OrderType = z.infer<typeof orderType>;

export const deliveryMethod = z.enum(['NONE', 'PICKUP', 'DELIVERY']);
export type DeliveryMethod = z.infer<typeof deliveryMethod>;

export const movementType = z.enum(['IN', 'OUT']);
export type MovementType = z.infer<typeof movementType>;

export const packingType = z.enum(['SACK', 'PALLET', 'CARTON', 'OTHER', 'NONE']);
export type PackingType = z.infer<typeof packingType>;

// Base types from database schema
// export type Order = typeof orders.$inferSelect;
export type InsertOrder = typeof orders.$inferInsert;

export type OrderItem = typeof orderItems.$inferSelect;
export type InsertOrderItem = typeof orderItems.$inferInsert;

export const OrderTable = z.object({
    orderId: z.string().uuid(),
    orderNumber: z.number().positive(),
    customerId: z.string().uuid(),
    orderType: orderType,
    movement: movementType,
    packingType: packingType,
    deliveryMethod: deliveryMethod,
    status: orderStatus,
    addressId: z.string().uuid().nullable(),
    fulfilledAt: z.date().nullable().nullish().optional(),
    notes: z.string().nullable(),

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
        userType: z.enum(['EMPLOYEE', 'CUSTOMER', 'DEMO']),
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
    orderType: orderType.default('CUSTOMER_ORDER'),
    movement: movementType,
    packingType: packingType.default('NONE'),
    deliveryMethod: deliveryMethod.default('NONE'),
    status: orderStatus.default('PENDING'),
    addressId: z.string().uuid().optional().nullable(),
    notes: z.string().optional().nullable(),
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
    status?: OrderStatus;
    customerId?: string;
    dateRange?: {
        from: Date;
        to: Date;
    };
    movement?: MovementType;
    search?: string;
}

export type OrderSortField = 'orderNumber' | 'createdAt' | 'status' | 'customerName';

export interface OrderSort {
    field: OrderSortField;
    direction: 'asc' | 'desc';
}