"use server";

import { z } from 'zod';
import { db } from '@/server/db';
import { auth } from '@/lib/auth/auth';
import { orders, orderItems, customers, items, users } from '@/server/db/schema';
import { eq, and, desc, asc, sql, gte, lte } from 'drizzle-orm';
import { createOrderSchema, deliveryMethod, EnrichedOrders, packingType, UpdateOrderInput, updateOrderSchema, type OrderFilters, type OrderSort } from '@/types/orders';
import useDelay from '@/hooks/useDelay';

export type OrderActionResponse = {
    success: boolean;
    data?: any;
    error?: string;
};

export interface OrderUpdateResult {
  success: boolean;
  data?: EnrichedOrders;
  error?: {
    message: string;
    code?: string;
    field?: string;
  };
}

export async function createOrder(formData: FormData): Promise<OrderActionResponse> {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return { success: false, error: "Unauthorized: Must be logged in to create orders." };
        }
        // console.log('1231231231231:',
        //     //     "customerId:", formData.get('customerId'),
        //     //     "orderType:", formData.get('orderType'),
        //     //     "movement:", formData.get('movement'),
        //     //     "packingType:", formData.get('packingType'),
        //     //     "deliveryMethod:", formData.get('deliveryMethod'),
        //     //     "status:", formData.get('status'),
        //     //     "addressId:", formData.get('addressId'),
        //     //     "notes:", formData.get('notes'),
        //     //     "items:", JSON.parse(formData.get('items') as string)
        // );
        const formObject: Record<string, any> = {};
        const items: { itemId: string; quantity: number, itemLocationId: string }[] = [];

        // First pass to collect all form fields
        formData.forEach((value, key) => {
            if (key.startsWith('items.')) {
                const [_, index, field] = key.split('.');
                if (!items[parseInt(index)]) {
                    items[parseInt(index)] = { itemId: '', quantity: 0, itemLocationId: '' };
                }
                if (field === 'itemId') {
                    items[parseInt(index)].itemId = value as string;
                } else if (field === 'quantity') {
                    items[parseInt(index)].quantity = parseInt(value as string) || 0;
                } else if (field === 'itemLocationId') {
                    items[parseInt(index)].itemLocationId = value as string;
                }

            } else if (value !== undefined) {
                formObject[key] = value;
            }
        });

        // Filter out any incomplete items
        const validItems = items.filter(item => item.itemId && item.quantity > 0);
        formObject.items = validItems;

        // console.log('Processed form data:', JSON.stringify(formObject));

        const validatedFields = createOrderSchema.safeParse({
            customerId: formObject.customerId,
            orderType: formObject.orderType,
            movement: formObject.movement,
            packingType: formObject.packingType,
            deliveryMethod: formObject.deliveryMethod,
            status: formObject.status,
            addressId: formObject.addressId,
            notes: formObject.notes,
            items: formObject.items,
            createdBy: session?.user.id ?? ""
        });
        // console.log('Validated Fields:', validatedFields);

        if (!validatedFields.success) {
            return { success: false, error: validatedFields.error.message };
        }

        const orderData = validatedFields.data;

        // Start a transaction to insert order and items
        const result = await db.transaction(async (tx) => {
            const [newOrder] = await tx.insert(orders).values({
                customerId: orderData.customerId,
                orderType: orderData.orderType,
                movement: orderData.movement,
                packingType: orderData.packingType,
                deliveryMethod: orderData.deliveryMethod,
                status: orderData.status,
                addressId: orderData.addressId,
                notes: orderData.notes,
                createdBy: session?.user.id ?? ""
            }).returning();

            try {
                // Insert order items
                const orderItemsData = orderData.items.map(item => ({
                    orderId: newOrder.orderId,
                    itemId: item.itemId,
                    quantity: item.quantity,
                    itemLocationId: item.itemLocationId
                }));

                await tx.insert(orderItems).values(orderItemsData);
            } catch (error) {
                throw new Error(`Failed to insert order items: ${error instanceof Error ? error.message : 'Unknown error'}`);
            }

            return newOrder;
        });

        return { success: true, data: result };
    } catch (error) {
        console.error('Error in createOrder:', error);
        return { success: false, error: 'Failed to create order' };
    }
}


export async function updateOrder(orderData: UpdateOrderInput): Promise<OrderUpdateResult> {
    try {
      const session = await auth();
      if (!session?.user?.id) {
        return { success: false, error: { message: "Unauthorized: Must be logged in to update orders." } };
      }
  
      // Validate the update data
      const validatedFields = updateOrderSchema.safeParse(orderData);
  
      if (!validatedFields.success) {
        return { success: false, error: { message: validatedFields.error.message } };
      }
  
      const updateData = validatedFields.data;
  
      // Start a transaction to update the order
      const result = await db.transaction(async (tx) => {
        // Update order
        const [updatedOrder] = await tx
          .update(orders)
          .set({
            status: updateData.status,
            movement: updateData.movement,
            packingType: updateData.packingType,
            deliveryMethod: updateData.deliveryMethod,
            notes: updateData.notes,
            updatedAt: new Date(),
          })
          .where(eq(orders.orderId, updateData.orderId))
          .returning();
  
        if (!updatedOrder) {
          throw new Error('Order update failed: No rows affected.');
        }

        // Update order items if they're provided
        if (updateData.items && updateData.items.length > 0) {
          // First delete existing items
          await tx
            .delete(orderItems)
            .where(eq(orderItems.orderId, updateData.orderId));
          
          // Then insert the updated items
          const orderItemsData = updateData.items.map(item => ({
            orderId: updateData.orderId,
            itemId: item.itemId,
            quantity: item.quantity,
            itemLocationId: item.itemLocationId
          }));
          
          await tx.insert(orderItems).values(orderItemsData);
        }
        
        // Get complete updated order with items for return
        const fullOrder = await getOrderById(updateData.orderId);
        if (!fullOrder.success || !fullOrder.data) {
          throw new Error('Failed to retrieve updated order.');
        }
        
        return fullOrder.data;
      });
      
      return { success: true, data: result as EnrichedOrders };
    } catch (error:any) {
        console.error('Error in updateOrder:', error);
        return {
            success: false,
            error: {message: error instanceof Error ? error.message : 'Failed to update order'}
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

        const order = results.rows[0];
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
        console.error('Error in getOrderById:', error);
        return { success: false, error: 'Failed to fetch order' };
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
        const totalCount = results[0].totalCount || 0;

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
