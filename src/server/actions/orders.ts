"use server";

import { z } from 'zod';
import { db } from '@/server/db';
import { auth } from '@/lib/auth/auth';
import { orders, orderItems, customers, items, users, itemStock } from '@/server/db/schema';
import { eq, and, desc, asc, sql, gte, lte, inArray } from 'drizzle-orm';
import { CreateOrderInput, createOrderSchema, EnrichedOrders, EnrichedOrderSchemaType, UpdateOrderInput, updateOrderSchema, type OrderFilters, type OrderSort } from '@/types/orders';
import useDelay from '@/hooks/useDelay';

// export type OrderActionResponse = {
//     success: boolean;
//     data?: EnrichedOrderSchemaType;
//     error?: string;
// };

export type OrderActionResponse = {
    success: boolean;
    data?: EnrichedOrderSchemaType;
    error?: string;
    validationErrors?: Record<string, string[]>; // For potential future use
    originalOrderNumber?: string | number; // To track the original JSON order number in response
};


export async function createOrder(orderData: CreateOrderInput): Promise<OrderActionResponse> {
    // Removed formData parameter and changed to orderData: CreateOrderInput
    // export async function createOrder(formData: FormData): Promise<OrderActionResponse> {


    try {
        const session = await auth();
        if (!session?.user?.id) {
            return { success: false, error: "Unauthorized: Must be logged in to create orders." };
        }


        const validatedFields = createOrderSchema.safeParse(orderData);

        if (!validatedFields.success) {
            return { success: false, error: validatedFields.error.message };
        }

        const orderDataPayload = validatedFields.data;
        const result = await db.transaction(async (tx) => {

            if (orderDataPayload.status === 'COMPLETED' && orderDataPayload.movement === 'OUT') {
                const requiredStock = orderDataPayload.items.map(item => ({
                    itemId: item.itemId,
                    requiredQuantity: item.quantity,
                }));

                if (requiredStock.length > 0) {
                    const itemIds = requiredStock.map(item => item.itemId);

                    // Fetch current stock AND item properties (including allowNegative) in one go
                    const itemDetailsAndStock = await tx.select({
                        itemId: items.itemId,
                        itemName: items.itemName,
                        allowNegative: items.allowNegative, // Fetch the allowNegative flag
                        available: itemStock.currentQuantity // Fetch current stock
                    })
                        .from(items)
                        // Left join in case an item exists but has no stock record yet (available will be null)
                        .leftJoin(itemStock, eq(items.itemId, itemStock.itemId))
                        // Add location filter here if stock is location-specific and you track it per location
                        // .where(and(inArray(items.itemId, itemIds), eq(itemStock.locationId, 'YOUR_DEFAULT_LOCATION_ID_OR_VARIABLE')))
                        .where(inArray(items.itemId, itemIds)); // Filter for relevant items


                    // Create maps for easy lookup
                    const stockMap = new Map(itemDetailsAndStock.map(s => [ s.itemId, s.available ?? 0 ])); // Default to 0 if no stock record
                    const itemNameMap = new Map(itemDetailsAndStock.map(s => [ s.itemId, s.itemName ]));
                    const allowNegativeMap = new Map(itemDetailsAndStock.map(s => [ s.itemId, s.allowNegative ?? false ])); // Default to false if flag is null

                    // Check each item
                    for (const item of requiredStock) {
                        const available = stockMap.get(item.itemId) ?? 0; // Default to 0 again just in case
                        const itemName = itemNameMap.get(item.itemId) ?? `Unknown Item (ID: ${item.itemId})`;
                        const allowNegative = allowNegativeMap.get(item.itemId) ?? false; // Default to false

                        // Check if stock is insufficient AND negative stock is NOT allowed
                        if (available < item.requiredQuantity && !allowNegative) {
                            // Insufficient stock - throw error BEFORE inserting the order
                            throw new Error(` Insufficient stock for ${itemName}.\n Required: ${item.requiredQuantity}, Available: ${available} (Negative stock not allowed for this item)`);
                        }
                    }
                    // If we reach here, stock is sufficient (or negative allowed) for all items
                    console.log("Stock pre-check passed (considering allowNegative).");
                }
            }
            // --- End of Stock Pre-check Modification ---

            const [ newOrder ] = await tx.insert(orders).values({
                customerId: orderDataPayload.customerId,
                orderType: orderDataPayload.orderType,
                movement: orderDataPayload.movement,
                packingType: orderDataPayload.packingType,
                deliveryMethod: orderDataPayload.deliveryMethod,
                // status: orderData.status,
                status: orderDataPayload.status === 'COMPLETED' ? 'PENDING' : orderDataPayload.status, // Temporarily set to PENDING if it's COMPLETED
                orderNumber: orderDataPayload.orderNumber ?? undefined,
                addressId: orderDataPayload.addressId,
                notes: orderDataPayload.notes,
                createdBy: session?.user.id ?? "",
                createdAt: orderDataPayload.createdAt ?? undefined,

            }).returning();

            let orderItemsData = [];

            try {
                // Insert order items
                const itemsToInsert = orderDataPayload.items.map(item => ({
                    orderId: newOrder.orderId,
                    itemId: item.itemId,
                    quantity: item.quantity,
                    itemLocationId: item.itemLocationId
                }));

                orderItemsData = await tx.insert(orderItems).values(itemsToInsert).returning();


                // If the original status was COMPLETED, update it now after items are inserted
                if (orderDataPayload.status === 'COMPLETED') {
                    // Use a raw SQL update to avoid ORM auto-timestamps
                    await tx.execute(sql`
                        UPDATE orders
                        SET status = 'COMPLETED'
                        WHERE order_id = ${newOrder.orderId}
                    `);
                }
            } catch (error) {
                console.log(newOrder)
                // console.error('Error:', error);
                throw new Error(error instanceof Error ? error.message : 'Unknown error');
            }

            // Fetch customer name and item names
            const customer = await tx.query.customers.findFirst({
                where: eq(customers.customerId, orderDataPayload.customerId),
                columns: { displayName: true }
            });

            const itemDetails = await tx.select({
                itemId: items.itemId,
                itemName: items.itemName
            }).from(items)
                .where(inArray(items.itemId, orderDataPayload.items.map(item => item.itemId)));

            const itemNameMap = new Map(itemDetails.map(item => [ item.itemId, item.itemName ]));


            const enrichedOrderData: EnrichedOrderSchemaType = {
                ...newOrder,
                customerName: customer?.displayName ?? 'Unknown Customer',
                creator: {
                    userId: session?.user.id ?? '',
                    firstName: session?.user?.name?.split(' ')[ 0 ] ?? 'Unknown', // Basic name split, might need improvement
                    lastName: session?.user?.name?.split(' ')[ 1 ] ?? 'User', // Basic name split, might need improvement
                    userType: session?.user.userType
                },
                items: orderItemsData.map(orderItem => ({
                    itemId: orderItem.itemId,
                    itemName: itemNameMap.get(orderItem.itemId) ?? 'Unknown Item',
                    quantity: orderItem.quantity,
                    itemLocationId: orderItem.itemLocationId!,
                })),
            };

            return enrichedOrderData;
        });


        return { success: true, data: result };
    } catch (error: any) {
        console.log('Error in createOrder:')
        console.error(error);
        return { success: false, error: error.message || 'Failed to create order' };
    }
}

export interface OrderUpdateResult {
    success: boolean;
    data?: EnrichedOrderSchemaType; // Updated to EnrichedOrderSchemaType
    error?: {
        message: string;
        code?: string;
        field?: string;
    };
}
export async function updateOrder(orderData: UpdateOrderInput): Promise<OrderActionResponse> { // Updated return type to OrderActionResponse
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return { success: false, error: "Unauthorized: Must be logged in to update orders." }; // Updated error return
        }

        // Validate the update data
        const validatedFields = updateOrderSchema.safeParse(orderData);

        if (!validatedFields.success) {
            return { success: false, error: validatedFields.error.message }; // Updated error return
        }

        const updateData = validatedFields.data;

        // Start a transaction to update the order
        const result = await db.transaction(async (tx) => {
            // Update order
            const [ updatedOrder ] = await tx
                .update(orders)
                .set({
                    status: updateData.status,
                    movement: updateData.movement,
                    packingType: updateData.packingType,
                    deliveryMethod: updateData.deliveryMethod,
                    notes: updateData.notes,
                    orderMark: updateData.orderMark,
                    updatedAt: new Date(),
                })
                .where(eq(orders.orderId, updateData.orderId))
                .returning();

            if (!updatedOrder) {
                throw new Error('Order update failed: No rows affected.');
            }

            // Update order items if they're provided
            let orderItemsData = [];
            if (updateData.items && updateData.items.length > 0) {
                // First delete existing items
                await tx
                    .delete(orderItems)
                    .where(eq(orderItems.orderId, updateData.orderId));

                // Then insert the updated items
                const itemsToInsert = updateData.items.map(item => ({
                    orderId: updateData.orderId,
                    itemId: item.itemId,
                    quantity: item.quantity,
                    itemLocationId: item.itemLocationId
                }));

                orderItemsData = await tx.insert(orderItems).values(itemsToInsert).returning();
            } else {
                orderItemsData = await tx.select().from(orderItems).where(eq(orderItems.orderId, updateData.orderId));
            }


            // Fetch customer name and item names
            const customer = await tx.query.customers.findFirst({
                where: eq(customers.customerId, updatedOrder.customerId),
                columns: { displayName: true }
            });

            const itemDetails = await tx.select({
                itemId: items.itemId,
                itemName: items.itemName
            }).from(items)
                .where(inArray(
                    items.itemId,
                    orderItemsData.map(item => item.itemId)
                ));

            const itemNameMap = new Map(itemDetails.map(item => [ item.itemId, item.itemName ]));


            const enrichedOrderData: EnrichedOrderSchemaType = {
                ...updatedOrder,
                customerName: customer?.displayName ?? 'Unknown Customer',
                creator: {
                    userId: session?.user.id ?? '',
                    firstName: session?.user?.name?.split(' ')[ 0 ] ?? 'Unknown', // Basic name split, might need improvement
                    lastName: session?.user?.name?.split(' ')[ 1 ] ?? 'User', // Basic name split, might need improvement
                    userType: session?.user.userType
                },
                items: orderItemsData.map(orderItem => ({
                    itemId: orderItem.itemId,
                    itemName: itemNameMap.get(orderItem.itemId) ?? 'Unknown Item',
                    quantity: orderItem.quantity,
                    itemLocationId: orderItem.itemLocationId!,
                })),
            };


            return enrichedOrderData;
        });

        return { success: true, data: result }; // Updated success return
    } catch (error: any) {
        console.error('Error in updateOrder:', error);
        return {
            success: false,
            error: error.message || 'Failed to update order' // Updated error return
        };
    }
}



export type GetSingleOrderResponse = {
    success: boolean;
    data?: EnrichedOrders;
    error?: string;
};


export async function getOrderById(orderId: string): Promise<GetSingleOrderResponse> {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return { success: false, error: "Unauthorized: Must be logged in to fetch order." };
        }

        const rawQuery = sql<EnrichedOrders[]>`
            SELECT
                ${orders}.*,
                ${customers}.display_name as "displayName",
                ${users}.first_name as "creatorFirstName",
                ${users}.last_name as "creatorLastName",
                ${users}.user_type as "creatorUserType",
                COALESCE(json_agg(
                    CASE WHEN ${items}.item_id IS NOT NULL THEN
                        jsonb_build_object(
                            'itemId', ${items}.item_id,
                            'itemName', ${items}.item_name,
                            'quantity', ${orderItems}.quantity,
                            'itemLocationId', ${orderItems}.item_location_id
                        )
                    END
                ) FILTER (WHERE ${items}.item_id IS NOT NULL), '[]') AS items
            FROM ${orders}
            LEFT JOIN ${customers} ON ${orders}.customer_id = ${customers}.customer_id
            LEFT JOIN ${orderItems} ON ${orders}.order_id = ${orderItems}.order_id
            LEFT JOIN ${items} ON ${orderItems}.item_id = ${items}.item_id
            LEFT JOIN ${users} ON ${orders}.created_by = ${users}.user_id
            WHERE ${orders}.order_id = ${orderId}
            GROUP BY ${orders}.order_id, ${customers}.customer_id, ${users}.user_id
        `;

        const results = await db.execute(rawQuery);

        if (!results?.rows || !Array.isArray(results.rows) || results.rows.length === 0) {
            return { success: false, error: 'Order not found' };
        }

        const order = results.rows[ 0 ];
        const enrichedOrder = {
            orderId: order.order_id,
            orderNumber: Number(order.order_number) || 0,
            customerId: order.customer_id,
            orderType: order.order_type || 'CUSTOMER_ORDER',
            movement: order.movement || 'IN',
            packingType: order.packing_type || 'NONE',
            deliveryMethod: order.delivery_method || 'NONE',
            status: order.status || 'PENDING',
            addressId: order.address_id || null,
            orderMark: order.order_mark || null,
            fulliedAt: order.fullied_at ? new Date(order.fullied_at.toString()) : null,
            notes: order.notes || null,
            createdBy: order.created_by,
            createdAt: order.created_at ? new Date(order.created_at.toString()) : new Date(),
            updatedAt: order.updated_at ? new Date(order.updated_at.toString()) : null,
            isDeleted: Boolean(order.is_deleted),
            customerName: order.displayName || 'Unknown Customer',
            creator: {
                userId: order.created_by,
                firstName: order.creatorFirstName || '',
                lastName: order.creatorLastName || '',
                userType: order.creatorUserType || 'EMPLOYEE',
            },
            items: Array.isArray(order.items)
                ? order.items.map((item: any) => ({
                    itemId: item.itemId || '',
                    itemName: item.itemName || '',
                    quantity: Number(item.quantity) || 0,
                    itemLocationId: item.itemLocationId
                })).filter(item => item.itemId && item.quantity > 0)
                : []
        };

        const parsedOrder = EnrichedOrders.parse(enrichedOrder);
        return { success: true, data: parsedOrder };
    } catch (error) {
        console.error('Error in getOrderById E231:', error);
        return { success: false, error: 'Failed to fetch order' + error };
    }
}

export type GetOrderActionResponse = {
    success: boolean;
    data?: {
        orders: EnrichedOrders[] | any;
        pagination: {
            total: number;
            pageSize: number;
            currentPage: number;
            totalPages: number;
        };
    };
    error?: string;
};

// Helper functions for query building 
function withFilters(
    qb: any,
    filters: OrderFilters,
    session: any
) {
    let query = qb;

    // User type restriction
    if (session.user.userType === 'CUSTOMER' && session.user.customerId) {
        query = query.where(eq(orders.customerId, session.user.customerId));
    }

    if (filters.customerId) {
        query = query.where(eq(orders.customerId, filters.customerId));
    }

    if (filters.status) {
        query = query.where(eq(orders.status, filters.status));
    }

    if (filters.movement) {
        query = query.where(eq(orders.movement, filters.movement));
    }

    if (filters.dateRange) {
        query = query.where(
            and(
                gte(orders.createdAt, filters.dateRange.from),
                lte(orders.createdAt, filters.dateRange.to)
            )
        );
    }

    return query;
}

function withPagination(
    qb: any,
    page: number = 1,
    pageSize: number = 100
) {
    return qb.limit(pageSize).offset((page - 1) * pageSize);
}

function withSort(
    qb: any,
    sort: OrderSort
) {
    // Clear any existing order by clauses
    const freshQuery = qb.orderBy();

    // Map field names to schema properties
    let field;
    if (sort.field === 'orderNumber') field = orders.orderNumber;
    else if (sort.field === 'status') field = orders.status;
    else if (sort.field === 'customerName') field = customers.displayName;
    else field = orders.createdAt;

    return freshQuery.orderBy(
        sort.direction === 'desc' ? desc(field) : asc(field)
    );
}

export async function getOrders(
    page: number = 1,
    pageSize: number = 100,
    filters: OrderFilters = {},
    sort: OrderSort = { field: 'createdAt', direction: 'desc' }
): Promise<GetOrderActionResponse> {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return { success: false, error: "Unauthorized: Please login." };
        }

        // Build optimized query with total count included
        let query = db.select({
            orderId: orders.orderId,
            orderNumber: orders.orderNumber,
            customerId: orders.customerId,
            orderType: orders.orderType,
            movement: orders.movement,
            packingType: orders.packingType,
            deliveryMethod: orders.deliveryMethod,
            status: orders.status,
            notes: orders.notes,
            createdAt: orders.createdAt,
            updatedAt: orders.updatedAt,
            customerName: customers.displayName,
            creatorFirstName: users.firstName,
            creatorLastName: users.lastName,
            totalCount: sql<number>`count(*) over()::integer`,
            // Only include essential fields for list view
            items: sql<any>`COALESCE(
                json_agg(
                    jsonb_build_object(
                        'itemId', ${items.itemId},
                        'itemName', ${items.itemName},
                        'quantity', ${orderItems.quantity}
                    ) 
                    ORDER BY ${items.itemName}
                ) FILTER (WHERE ${items.itemId} IS NOT NULL),
                '[]'::json)`
        })
            .from(orders)
            .leftJoin(customers, eq(orders.customerId, customers.customerId))
            .leftJoin(orderItems, eq(orders.orderId, orderItems.orderId))
            .leftJoin(items, eq(orderItems.itemId, items.itemId))
            .leftJoin(users, eq(orders.createdBy, users.userId))
            .groupBy(
                orders.orderId,
                customers.customerId,
                customers.displayName,
                users.firstName,
                users.lastName
            )
            .$dynamic();

        // Apply filters, sorting and pagination
        query = withFilters(query, filters, session);
        query = withSort(query, sort);
        query = withPagination(query, page, pageSize);

        // Execute query
        const results = await query;

        if (!results || results.length === 0) {
            return {
                success: true,
                data: {
                    orders: [],
                    pagination: {
                        total: 0,
                        pageSize,
                        currentPage: page,
                        totalPages: 0
                    }
                }
            };
        }

        // Get total count from first row
        const totalCount = results[ 0 ].totalCount || 0;

        // Transform and validate orders
        const enrichedOrders = results.map(order => {
            // Parse items to ensure they're in the correct format
            const itemsArray = Array.isArray(order.items)
                ? order.items.map((item: any) => ({
                    itemId: item.itemId || '',
                    itemName: item.itemName || '',
                    quantity: Number(item.quantity) || 0
                }))
                : [];

            return {
                orderId: order.orderId,
                orderNumber: Number(order.orderNumber) || 0,
                customerId: order.customerId,
                orderType: order.orderType || 'CUSTOMER_ORDER',
                movement: order.movement || 'IN',
                packingType: order.packingType || 'NONE',
                deliveryMethod: order.deliveryMethod || 'NONE',
                status: order.status || 'PENDING',
                notes: order.notes || '',
                createdAt: order.createdAt ? new Date(order.createdAt) : new Date(),
                updatedAt: order.updatedAt ? new Date(order.updatedAt) : null,
                customerName: order.customerName || 'Unknown Customer',
                creator: {
                    firstName: order.creatorFirstName || '',
                    lastName: order.creatorLastName || ''
                },
                items: itemsArray
            };
        });

        // Remove totalCount from result objects
        const data = enrichedOrders.map(({ totalCount: _, ...rest }: any) => rest);

        return {
            success: true,
            data: {
                orders: data,
                pagination: {
                    total: totalCount,
                    pageSize,
                    currentPage: page,
                    totalPages: Math.ceil(totalCount / pageSize)
                }
            }
        };
    } catch (error) {
        console.error('Error in getOrders:', error);
        return { success: false, error: error instanceof Error ? error.message : "Unknown error fetching orders" };
    }
}
