import { z } from 'zod';
import { addressDetails, items, orderItems, orders, userType, userTypeSchema } from '@/server/db/schema';
import { ItemSchema } from './items';
import { orderTypeSchema, orderStatusSchema, movementTypeSchema, deliveryMethodSchema, packingTypeSchema } from '@/server/db/schema';
import { createInsertSchema, createSelectSchema, createUpdateSchema } from 'drizzle-zod';
import { uuid } from 'drizzle-orm/pg-core';
import { orderExpenseSchema, orderExpenseWithName } from './expense';
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
export const testCreateUpdateOrderSchema = CreateOrderSchemaWithoutItems.extend({
    orderId: z.string().uuid().optional(),
    items: z.array(
        z.object({
            itemId: z.string(),
            quantity: z.number().positive(),
            itemLocationId: z.string().uuid()
        })
    ).min(1, 'At least one item is required')
})
export type testCreateUpdateOrderSchemaType = z.infer<typeof testCreateUpdateOrderSchema>
export const CreateOrderSchema = CreateOrderSchemaWithoutItems.extend({
    // items: z.array(
    //     z.object({
    //         itemId: z.string().uuid(),
    //         quantity: z.number().positive(),
    //         itemLocationId: z.string().uuid()
    //     })
    // ).min(1, 'At least one item is required')
    items: z.array(
        z.object({
            itemId: z.string().uuid(),
            quantity: z.number().positive(),
            itemLocationId: z.string().uuid()
        })
    )
        .transform((items) => {
            return items.filter(item => item.itemId); // Filters out items with empty itemId
        })
        .refine(items => items.length > 0, {
            message: 'At least one item is required!!!!!!! FILTERING OUT IS NOT WORKING',
        })
})
export type CreateOrderSchemaType = z.infer<typeof CreateOrderSchema>

export const UpdateOrderSchemaWithoutItems = createUpdateSchema(orders,{
    orderId: z.string().uuid()
})
// export const UpdateOrderSchema = UpdateOrderSchemaWithoutItems.extend({
//     items: z.array(
//         z.object({
//             itemId: z.string().uuid(),
//             quantity: z.number().positive(),
//             itemLocationId: z.string().uuid()
//         })
//     ).min(1, 'At least one item is required')
// })
export const UpdateOrderSchema = UpdateOrderSchemaWithoutItems.extend({
    items: z.array(
        z.object({
            itemId: z.string().uuid(),
            quantity: z.number().positive(),
            itemLocationId: z.string().uuid()
        })
    )
        .transform((items) => {
            return items.filter(item => item.itemId); // Filters out items with empty itemId
        })
        .refine(items => items.length > 0, {
            message: 'At least one item is required',
        })
})

export type UpdateOrderSchemaType = z.infer<typeof UpdateOrderSchema>

export const EnrichedOrderSchema1 = OrderSchema.extend({
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
    expenses: z.array(orderExpenseWithName).optional()
});
export const EnrichedOrderSchema = EnrichedOrderSchema1.partial({
    fulfilledAt: true

})
    
export type EnrichedOrderSchemaType = z.infer<typeof EnrichedOrderSchema>;

export const dummyOrderData = {
    orderId: 'dummy-order-id',
    orderNumber: 12345,
    customerId: 'dummy-customer-id',
    orderType: 'CUSTOMER_ORDER',
    movement: 'DELIVERY',
    packingType: 'CARTON',
    deliveryMethod: 'COURIER',
    status: 'PENDING',
    addressId: 'dummy-address-id',
    fulfilledAt: null,
    notes: 'Dummy order data',
    orderMark: 'Dummy Mark',
    createdBy: 'dummy-user-id',
    createdAt: new Date(),
    updatedAt: new Date(),
    isDeleted: false,
    customerName: 'Dummy Customer',
    creator: {
        userId: 'dummy-creator-id',
        firstName: 'Dummy',
        lastName: 'Creator',
        userType: 'ADMIN',
    },
    items: [
        {
            "itemId": "89bc83f4-0420-48cf-b3e5-2013d7216da3",
            "itemName": "Face masks",
            "quantity": 1,
            "itemLocationId": "4e176e92-e833-44f5-aea9-0537f980fb4b"
        },
        {
            "itemId": "e36c5e32-4990-4b86-a7d1-143b9c1bf8ac",
            "itemName": "Cloak V2",
            "quantity": 5,
            "itemLocationId": "4e176e92-e833-44f5-aea9-0537f980fb4b"
        }
    ],
    expenses: [
        {
            "orderExpenseId": "282682e4-2036-40bc-a6c5-0495f739cb72",
            "orderId": "97ab39e6-2055-49e3-baa9-65ff423ff108",
            "expenseItemId": "1aa82b76-fbf0-42ea-b17a-395e87cbf2fb",
            "expenseItemQuantity": 10,
            "notes": null,
            "createdBy": "4bb68f57-fc14-4e49-96a4-f26c75418547",
            "createdAt": new Date(),
            "updatedAt": new Date(),
            "expenseName": "Sack Small",
            "expensePrice": 5
        },
        {
            "orderExpenseId": "96658394-00b1-42a0-b1fa-dd405f1fd7a0",
            "orderId": "97ab39e6-2055-49e3-baa9-65ff423ff108",
            "expenseItemId": "969f409b-c721-43a1-b0a3-40950b8434fe",
            "expenseItemQuantity": 2,
            "notes": null,
            "createdBy": "4bb68f57-fc14-4e49-96a4-f26c75418547",
            "createdAt": new Date(),
            "updatedAt": new Date(),
            "expenseName": "Forklift Offloading",
            "expensePrice": 10
        },
        {
            "orderExpenseId": "c29747e4-2f6b-460e-a6fe-f69a1eea016b",
            "orderId": "97ab39e6-2055-49e3-baa9-65ff423ff108",
            "expenseItemId": "1aa82b76-fbf0-42ea-b17a-395e87cbf2fb",
            "expenseItemQuantity": 1,
            "notes": null,
            "createdBy": "4bb68f57-fc14-4e49-96a4-f26c75418547",
            "createdAt": new Date(),
            "updatedAt": new Date(),
            "expenseName": "Sack Small",
            "expensePrice": 5
        }
    ]
}