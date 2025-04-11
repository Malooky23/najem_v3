// Refactored order-queries.ts
'use server';

import { z } from 'zod';
import { db } from '@/server/db';
import { auth } from '@/lib/auth/auth';
import { orders, orderItems, customers, items, users, Order, orderExpenses } from '@/server/db/schema';
import { eq, and, desc, asc, sql, gte, lte, count, SQL } from 'drizzle-orm';
import {
    createOrderSchema,
    CreateOrderSchemaType,
    EnrichedOrderSchema, // Assuming this Zod schema exists
    EnrichedOrderSchemaType,
    UpdateOrderSchema, // Assuming this Zod schema exists
    UpdateOrderSchemaType,
    OrderSchema, // Assuming this base Zod schema exists
    OrderSchemaType,
    OrderFilters, // Keep using this type
    OrderSort,   // Keep using this type
    OrderItemSchema, // Assuming this Zod schema exists for items within an order
} from '@/types/orders'; // Assuming types are moved/defined here
import { ApiResponse } from '@/types/common'; // Use the common response type

// Type to represent a raw Order with its relations from the DB
// Adjust relations based on what's actually needed per function
type RawOrderWithRelations = Order & {
    customer: {
        displayName: typeof customers.$inferSelect[ 'displayName' ];
    } | null;
    createdBy: {
        firstName: typeof users.$inferSelect[ 'firstName' ];
        lastName: typeof users.$inferSelect[ 'lastName' ];
        userType: typeof users.$inferSelect[ 'userType' ];
    } | null;
    orderItems: ({
        quantity: typeof orderItems.$inferSelect[ 'quantity' ];
        itemLocationId: typeof orderItems.$inferSelect[ 'itemLocationId' ];
        item: {
            itemId: typeof items.$inferSelect[ 'itemId' ];
            itemName: typeof items.$inferSelect[ 'itemName' ];
            // Add other item fields if needed by EnrichedOrderSchema
        } | null;
    })[];
};

// Helper function to map raw DB data to the EnrichedOrderSchema structure
// Ensure this mapping aligns exactly with your EnrichedOrderSchema definition
function mapRawOrderToEnrichedSchema(rawOrder: RawOrderWithRelations): EnrichedOrderSchemaType {
    const mappedItems = (rawOrder.orderItems ?? [])
        .filter(oi => oi.item !== null) // Filter out items that couldn't be joined
        .map(oi => ({
            itemId: oi.item!.itemId, // Use non-null assertion as we filtered
            itemName: oi.item!.itemName,
            quantity: oi.quantity,
            itemLocationId: oi.itemLocationId,
            // Map other item fields if needed
        }));

    // Validate items separately if needed, or rely on the final schema validation
    const validatedItems = z.array(OrderItemSchema).safeParse(mappedItems);
    if (!validatedItems.success) {
        console.warn(`Item validation failed for order ${rawOrder.orderId}:`, validatedItems.error.issues);
        // Decide if this should throw or just return empty/filtered items
    }

    return {
        orderId: rawOrder.orderId,
        orderNumber: rawOrder.orderNumber,
        customerId: rawOrder.customerId,
        orderType: rawOrder.orderType,
        movement: rawOrder.movement,
        packingType: rawOrder.packingType,
        deliveryMethod: rawOrder.deliveryMethod,
        status: rawOrder.status,
        addressId: rawOrder.addressId,
        orderMark: rawOrder.orderMark,
        fulliedAt: rawOrder.fulliedAt,
        notes: rawOrder.notes,
        createdBy: rawOrder.createdBy ?? '', // Provide default if needed
        createdAt: rawOrder.createdAt,
        updatedAt: rawOrder.updatedAt,
        isDeleted: rawOrder.isDeleted,
        // Mapped from relations
        customerName: rawOrder.customer?.displayName ?? 'Unknown Customer',
        creator: rawOrder.createdBy ? {
            userId: rawOrder.createdBy, // userId comes from the relation key itself if needed
            firstName: rawOrder.createdBy?.firstName ?? '',
            lastName: rawOrder.createdBy?.lastName ?? '',
            userType: rawOrder.createdBy?.userType ?? 'UNKNOWN',
        } : null, // Handle case where creator might not be found/joined
        items: validatedItems.success ? validatedItems.data : [], // Use validated items
    };
}


export async function createOrder(formData: FormData): Promise<ApiResponse<OrderSchemaType>> {
    const session = await auth();
    if (!session?.user?.id) {
        return { success: false, message: "Unauthorized: Must be logged in to create orders." };
    }

    try {
        // Keep your FormData parsing logic - ensure it's robust
        const formObject: Record<string, any> = {};
        const items: { itemId: string; quantity: number, itemLocationId: string }[] = [];
        formData.forEach((value, key) => {
            if (key.startsWith('items.')) {
                const [ _, index, field ] = key.split('.');
                const idx = parseInt(index);
                if (!items[ idx ]) items[ idx ] = { itemId: '', quantity: 0, itemLocationId: '' };
                if (field === 'itemId') items[ idx ].itemId = value as string;
                else if (field === 'quantity') items[ idx ].quantity = parseInt(value as string) || 0;
                else if (field === 'itemLocationId') items[ idx ].itemLocationId = value as string;
            } else if (value !== undefined) {
                formObject[ key ] = value;
            }
        });
        const validItems = items.filter(item => item.itemId && item.quantity > 0 && item.itemLocationId);
        formObject.items = validItems;
        formObject.createdBy = session.user.id; // Add creator ID

        // Validate using the Zod schema
        const validatedFields = createOrderSchema.safeParse(formObject);

        if (!validatedFields.success) {
            console.error("Create Order Validation Error:", validatedFields.error.flatten());
            return { success: false, message: "Invalid input data.", error: validatedFields.error.flatten() };
        }

        const orderData = validatedFields.data;

        // Database transaction
        const result = await db.transaction(async (tx) => {
            const [ newOrder ] = await tx.insert(orders).values({
                customerId: orderData.customerId,
                orderType: orderData.orderType,
                movement: orderData.movement,
                packingType: orderData.packingType,
                deliveryMethod: orderData.deliveryMethod,
                status: orderData.status, // Ensure 'DRAFT' or appropriate initial status is set if needed
                addressId: orderData.addressId,
                notes: orderData.notes,
                createdBy: orderData.createdBy, // Already set from session
            }).returning(); // Return the newly created order row

            if (!newOrder) {
                throw new Error("Failed to create order header.");
            }

            // Insert order items
            if (orderData.items && orderData.items.length > 0) {
                const orderItemsData = orderData.items.map(item => ({
                    orderId: newOrder.orderId,
                    itemId: item.itemId,
                    quantity: item.quantity,
                    itemLocationId: item.itemLocationId
                }));
                await tx.insert(orderItems).values(orderItemsData);
            }

            return newOrder; // Return the basic order details
        });

        // Validate the raw result against the base OrderSchema (optional but good practice)
        const validatedResult = OrderSchema.safeParse(result);
        if (!validatedResult.success) {
            console.error("Post-creation validation failed:", validatedResult.error.issues);
            // Decide how to handle - maybe still return success but log warning?
            // Or return failure if the returned data doesn't match schema expectations.
            return { success: false, message: "Order created, but result data structure is invalid." };
        }


        return { success: true, message: "Order created successfully", data: validatedResult.data };

    } catch (error: any) {
        console.error('Error in createOrder:', error.message);
        return { success: false, message: `Failed to create order: ${error.message}` };
    }
}


export async function updateOrder(orderData: UpdateOrderSchemaType): Promise<ApiResponse<EnrichedOrderSchemaType>> {
    const session = await auth();
    if (!session?.user?.id) {
        return { success: false, message: "Unauthorized: Must be logged in to update orders." };
    }

    try {
        // Validate the input data using the specific Update schema
        const validatedFields = UpdateOrderSchema.safeParse(orderData);

        if (!validatedFields.success) {
            console.error("Update Order Validation Error:", validatedFields.error.flatten());
            return { success: false, message: "Invalid input data for update.", error: validatedFields.error.flatten() };
        }

        const updateData = validatedFields.data;

        // Database transaction
        const updatedOrderData = await db.transaction(async (tx) => {
            // 1. Update the main order details
            const [ updatedOrder ] = await tx
                .update(orders)
                .set({
                    // Only include fields defined in UpdateOrderSchema
                    status: updateData.status,
                    movement: updateData.movement,
                    packingType: updateData.packingType,
                    deliveryMethod: updateData.deliveryMethod,
                    addressId: updateData.addressId,
                    notes: updateData.notes,
                    orderMark: updateData.orderMark,
                    // Add other updatable fields as needed by your schema
                    updatedAt: new Date(), // Automatically set update timestamp
                })
                .where(eq(orders.orderId, updateData.orderId))
                .returning(); // Get the updated order row

            if (!updatedOrder) {
                throw new Error(`Order update failed: Order with ID ${updateData.orderId} not found or no changes made.`);
            }

            // 2. Handle order items update (if items are included in the update data)
            if (updateData.items) {
                // Delete existing items for this order first
                await tx.delete(orderItems).where(eq(orderItems.orderId, updateData.orderId));

                // Insert the new set of items if there are any
                if (updateData.items.length > 0) {
                    const orderItemsData = updateData.items.map(item => ({
                        orderId: updateData.orderId, // Use the ID from input data
                        itemId: item.itemId,
                        quantity: item.quantity,
                        itemLocationId: item.itemLocationId
                    }));
                    await tx.insert(orderItems).values(orderItemsData);
                }
            }

            // 3. Fetch the complete, updated order with all relations for the response
            // Use the internal fetch function for consistency
            const fullOrder = await internalGetOrderById(tx, updateData.orderId); // Pass transaction context if needed, or fetch outside
            if (!fullOrder) {
                // This shouldn't happen if the update succeeded, but handle defensively
                throw new Error('Failed to retrieve the updated order details after update.');
            }
            return fullOrder; // Return the raw data with relations
        });

        // Map the raw result from the transaction/fetch to the Enriched Schema structure
        const mappedOrder = mapRawOrderToEnrichedSchema(updatedOrderData);

        // Validate the final mapped structure
        const validatedResponse = EnrichedOrderSchema.safeParse(mappedOrder);

        if (!validatedResponse.success) {
            console.error("Data validation error post-update:", JSON.stringify(validatedResponse.error.issues, null, 2));
            // Decide: return success with potentially incomplete data, or return failure?
            // It's often better to return failure if the final structure is invalid.
            return { success: false, message: "Order updated, but the resulting data structure is invalid." };
        }

        return { success: true, message: "Order updated successfully", data: validatedResponse.data };

    } catch (error: any) {
        console.error('Error in updateOrder:', error.message);
        return { success: false, message: `Failed to update order: ${error.message}` };
    }
}

// Internal helper to fetch order, potentially within a transaction
async function internalGetOrderById(dbOrTx: typeof db | Parameters<Parameters<typeof db.transaction>[ 0 ]>[ 0 ], orderId: string): Promise<RawOrderWithRelations | null> {
    const rawOrder = await dbOrTx.query.orders.findFirst({
        where: eq(orders.orderId, orderId),
        with: {
            customer: { columns: { displayName: true } },
            createdBy: { columns: { firstName: true, lastName: true, userType: true } },
            orderItems: {
                columns: { quantity: true, itemLocationId: true },
                with: {
                    item: { columns: { itemId: true, itemName: true } }
                }
            },
            orderExpenses: true
        }
    });
    return rawOrder ?? null;
}


export async function getOrderById(orderId: string): Promise<ApiResponse<EnrichedOrderSchemaType>> {
    const session = await auth();
    if (!session?.user?.id) {
        return { success: false, message: "Unauthorized: Must be logged in to fetch order." };
    }

    try {
        if (!orderId) {
            return { success: false, message: "Order ID is required." };
        }

        // Use the internal helper to fetch data using Drizzle query builder
        const rawOrder = await internalGetOrderById(db, orderId);

        if (!rawOrder) {
            return { success: false, message: 'Order not found' };
        }

        // Map the raw data to the schema structure
        const mappedOrder = mapRawOrderToEnrichedSchema(rawOrder);

        // Validate the final structure against the Zod schema
        const validatedOrder = EnrichedOrderSchema.safeParse(mappedOrder);

        if (!validatedOrder.success) {
            console.error("Data validation error for getOrderById:", JSON.stringify(validatedOrder.error.issues, null, 2));
            throw new Error("Invalid Order data structure received from database"); // Or return ApiResponse failure
            // return { success: false, message: "Invalid Order data structure received from database." };
        }

        return { success: true, data: validatedOrder.data };

    } catch (error: any) {
        console.error('Error in getOrderById:', error.message);
        return { success: false, message: `Failed to fetch order: ${error.message}` };
    }
}

// Define response type for getOrders consistent with ApiResponse but with pagination
export type GetOrdersResponse = ApiResponse<{
    orders: EnrichedOrderSchemaType[];
    pagination: {
        total: number;
        pageSize: number;
        currentPage: number;
        totalPages: number;
    };
}>;

export async function getOrders(
    page: number = 1,
    pageSize: number = 100,
    filters: OrderFilters = {},
    sort: OrderSort = { field: 'createdAt', direction: 'desc' }
): Promise<GetOrdersResponse> {
    const session = await auth();
    if (!session?.user?.id) {
        return { success: false, message: "Unauthorized: Please login." };
    }

    try {
        // --- Query Building ---
        const conditions: SQL[] = [];

        // Default condition (if needed, e.g., not deleted)
        // conditions.push(eq(orders.isDeleted, false)); // Add if you have soft delete

        // User type restriction
        if (session.user.userType === 'CUSTOMER' && session.user.customerId) {
            conditions.push(eq(orders.customerId, session.user.customerId));
        } else if (filters.customerId) { // Allow admin/employee to filter by customer
            conditions.push(eq(orders.customerId, filters.customerId));
        }

        // Other filters
        if (filters.status) conditions.push(eq(orders.status, filters.status));
        if (filters.movement) conditions.push(eq(orders.movement, filters.movement));
        if (filters.dateRange?.from) conditions.push(gte(orders.createdAt, filters.dateRange.from));
        if (filters.dateRange?.to) conditions.push(lte(orders.createdAt, filters.dateRange.to));
        // Add more filters as needed (e.g., search term on notes, order number)

        const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

        // --- Count Query ---
        const countResult = await db.select({ count: count() })
            .from(orders)
            .where(whereClause) // Apply the same filters to the count
            .leftJoin(customers, eq(orders.customerId, customers.customerId)) // Join necessary for filters/sort on related tables
            .leftJoin(users, eq(orders.createdBy, users.userId)); // Join necessary for filters/sort

        const totalCount = countResult[ 0 ]?.count ?? 0;
        const totalPages = Math.ceil(totalCount / pageSize);

        if (totalCount === 0) {
            return {
                success: true,
                data: {
                    orders: [],
                    pagination: { total: 0, pageSize, currentPage: page, totalPages: 0 }
                }
            };
        }

        // --- Data Query ---
        // Define sorting
        let orderByClause;
        const sortFieldMap = {
            orderNumber: orders.orderNumber,
            status: orders.status,
            customerName: customers.displayName,
            createdAt: orders.createdAt,
            updatedAt: orders.updatedAt, // Example add
        };
        // Provide a default sort field if the input is invalid
        const sortColumn = sortFieldMap[ sort.field as keyof typeof sortFieldMap ] ?? orders.createdAt;
        orderByClause = sort.direction === 'desc' ? desc(sortColumn) : asc(sortColumn);


        // Fetch the actual data page
        const rawOrders = await db.query.orders.findMany({
            where: whereClause,
            orderBy: [ orderByClause ],
            limit: pageSize,
            offset: (page - 1) * pageSize,
            with: {
                // Include necessary relations for the list view
                // Keep these minimal for performance if possible
                customer: { columns: { displayName: true } },
                createdBy: { columns: { firstName: true, lastName: true } },
                // You might omit orderItems here if the list view doesn't need item details,
                // or fetch only basic info like item count if needed.
                // Example: Fetching items if needed by the enriched schema for lists
                orderItems: {
                    columns: { quantity: true, itemLocationId: true }, // Minimal item details
                    with: {
                        item: { columns: { itemId: true, itemName: true } } // Even more minimal
                    }
                }
            },
        });

        // --- Transformation & Validation ---
        // Map raw data to the desired schema structure
        const mappedOrders = rawOrders.map(order => mapRawOrderToEnrichedSchema(order as RawOrderWithRelations)); // Cast needed if relations aren't strictly typed on query result

        // Validate the array of mapped orders
        const validatedOrders = z.array(EnrichedOrderSchema).safeParse(mappedOrders);

        if (!validatedOrders.success) {
            console.error("Data validation error for getOrders list:", JSON.stringify(validatedOrders.error.issues, null, 2));
            // Decide how to handle - throw, return failure, return partial success?
            // Returning failure is safest if data integrity is crucial.
            return { success: false, message: "Invalid Order data structure received for list." };
        }

        return {
            success: true,
            data: {
                orders: validatedOrders.data,
                pagination: {
                    total: totalCount,
                    pageSize,
                    currentPage: page,
                    totalPages: totalPages
                }
            }
        };

    } catch (error: any) {
        console.error('Error in getOrders:', error.message);
        return { success: false, message: `Error fetching orders: ${error.message}` };
    }
}