'use server'
import { z } from 'zod';
import { db } from '@/server/db';
import { auth } from '@/lib/auth/auth';
import { orders, orderItems, customers, items, users, itemStock, orderExpenses, orderExpenseDetailsMaterializedView, expenseItems } from '@/server/db/schema';
// Import 'not' and 'sql'
import { eq, and, desc, asc, sql, gte, lte, inArray, not, or, SQL, SQLChunk, SQLWrapper } from 'drizzle-orm';
import {
    CreateOrderSchema,
    CreateOrderSchemaType,
    UpdateOrderSchema,
    UpdateOrderSchemaType,
    OrderFilters,
    OrderSort,
    EnrichedOrderSchema,
    EnrichedOrderSchemaType,
    OrderSchemaType,
    OrderSchema,
} from '@/types/orders';
import { ApiResponse, Pagination } from '@/types/common';
import { createOrderExpenseSchema, createOrderExpenseSchemaType, orderExpenseSchemaType, orderExpenseWithNameType } from '@/types/expense';
import { DBSearchOrderParams } from '@/hooks/data/useOrders';

// --- Helper Functions (Adapted from actions) ---

// Helper to build the base query with joins and essential fields
function buildBaseOrderQuery(txOrDb: typeof db | any = db) { // Allow transaction or db instance
    return txOrDb.select({
        // Select necessary fields from orders table
        orderId: orders.orderId,
        orderNumber: orders.orderNumber,
        customerId: orders.customerId,
        orderType: orders.orderType,
        movement: orders.movement,
        packingType: orders.packingType,
        deliveryMethod: orders.deliveryMethod,
        status: orders.status,
        addressId: orders.addressId,
        orderMark: orders.orderMark,
        fulliedAt: orders.fulfilledAt,
        notes: orders.notes,
        createdBy: orders.createdBy,
        createdAt: orders.createdAt,
        updatedAt: orders.updatedAt,
        isDeleted: orders.isDeleted,
        // Select fields from joined tables
        customerName: customers.displayName,
        creatorFirstName: users.firstName,
        creatorLastName: users.lastName,
        creatorUserType: users.userType,
        // Aggregate items - adjust fields as needed for OrderSchema
        items: sql<any>`COALESCE(
            json_agg(
                jsonb_build_object(
                    'itemId', ${items.itemId},
                    'itemName', ${items.itemName},
                    'quantity', ${orderItems.quantity},
                    'itemLocationId', ${orderItems.itemLocationId}
                )
                ORDER BY ${items.itemName}
            ) FILTER (WHERE ${items.itemId} IS NOT NULL),
            '[]'::json
        )`
    })
        .from(orders)
        .leftJoin(customers, eq(orders.customerId, customers.customerId))
        .leftJoin(orderItems, eq(orders.orderId, orderItems.orderId))
        .leftJoin(items, eq(orderItems.itemId, items.itemId))
        .leftJoin(users, eq(orders.createdBy, users.userId))
        .groupBy(
            orders.orderId,
            customers.customerId, // Include customerId in GROUP BY
            customers.displayName,
            users.userId // Include userId in GROUP BY
        );
}

// Helper to apply filters dynamically
function applyFilters(qb: any, filters: OrderFilters, sessionUserId?: string, sessionUserType?: string, sessionCustomerId?: string) {
    let conditions = [ eq(orders.isDeleted, false) ]; // Base condition: not deleted

    // User type restriction
    if (sessionUserType === 'CUSTOMER' && sessionCustomerId) {
        conditions.push(eq(orders.customerId, sessionCustomerId));
    }

    if (filters.customerId) {
        conditions.push(eq(orders.customerId, filters.customerId));
    }
    if (filters.status) {
        conditions.push(eq(orders.status, filters.status));
    }
    if (filters.movement) {
        conditions.push(eq(orders.movement, filters.movement));
    }
    if (filters.dateRange?.from) {
        conditions.push(gte(orders.createdAt, filters.dateRange.from));
    }
    if (filters.dateRange?.to) {
        conditions.push(lte(orders.createdAt, filters.dateRange.to));
    }
    // Add more filters as needed

    return qb.where(and(...conditions));
}

// Helper to apply sorting
function applySort(qb: any, sort: OrderSort) {
    let field;
    switch (sort.field) {
        case 'orderNumber': field = orders.orderNumber; break;
        case 'status': field = orders.status; break;
        case 'customerName': field = customers.displayName; break;
        case 'createdAt':
        default: field = orders.createdAt; break;
    }
    const direction = sort.direction === 'desc' ? desc : asc;
    return qb.orderBy(direction(field));
}

// Helper to apply pagination
function applyPagination(qb: any, page: number, pageSize: number) {
    return qb.limit(pageSize).offset((page - 1) * pageSize);
}

// Helper to map raw DB result to OrderSchemaType
function mapRawOrderToSchema(rawOrder: any): EnrichedOrderSchemaType {
    const itemsArray = Array.isArray(rawOrder.items)
        ? rawOrder.items.map((item: any) => ({
            itemId: item.itemId || '',
            itemName: item.itemName || '',
            quantity: Number(item.quantity) || 0,
            itemLocationId: item.itemLocationId
        })).filter((item: any) => item.itemId && item.quantity > 0)
        : [];

    // Fetch expenses separately or join them in the main query if needed often
    // For now, expenses are added later if needed by the specific use case
    const expensesArray: orderExpenseWithNameType[] = Array.isArray(rawOrder.expenses)
        ? rawOrder.expenses.map((exp: any) => ({
            orderExpenseId: exp.orderExpenseId,
            orderId: exp.orderId,
            expenseItemId: exp.expenseItemId,
            expenseItemQuantity: Number(exp.expenseItemQuantity) || 0,
            expenseName: exp.expenseName,
            expensePrice: exp.expensePrice,
            notes: exp.notes,
            createdBy: exp.createdBy,
            createdAt: exp.createdAt ? new Date(exp.createdAt) : new Date(),
            updatedAt: exp.updatedAt ? new Date(exp.updatedAt) : null,
        })).filter((exp: any) => exp.orderExpenseId) // Filter out potentially invalid expenses
        : [];

    return {
        orderId: rawOrder.orderId,
        orderNumber: Number(rawOrder.orderNumber) || 0,
        customerId: rawOrder.customerId,
        orderType: rawOrder.orderType || 'CUSTOMER_ORDER',
        movement: rawOrder.movement || 'IN',
        packingType: rawOrder.packingType || 'NONE',
        deliveryMethod: rawOrder.deliveryMethod || 'NONE',
        status: rawOrder.status || 'PENDING',
        addressId: rawOrder.addressId || null,
        orderMark: rawOrder.orderMark || null,
        fulfilledAt: rawOrder.fulliedAt ? new Date(rawOrder.fulliedAt.toString()) : null,
        notes: rawOrder.notes || null,
        createdBy: rawOrder.createdBy,
        createdAt: rawOrder.createdAt ? new Date(rawOrder.createdAt.toString()) : new Date(),
        updatedAt: rawOrder.updatedAt ? new Date(rawOrder.updatedAt.toString()) : null,
        isDeleted: Boolean(rawOrder.isDeleted),
        customerName: rawOrder.customerName || 'Unknown Customer',
        creator: {
            userId: rawOrder.createdBy,
            firstName: rawOrder.creatorFirstName || '',
            lastName: rawOrder.creatorLastName || '',
            userType: rawOrder.creatorUserType || 'EMPLOYEE',
        },
        items: itemsArray,
        expenses: expensesArray, // Include expenses in the mapped object
    };
}

// --- Main Query Functions ---
export async function fetchOrders(
    page: number = 1,
    pageSize: number = 20,
    filters: OrderFilters = {},
    sort: OrderSort = { field: 'orderNumber', direction: 'desc' }
): Promise<{ orders: EnrichedOrderSchemaType[], pagination: Pagination }> {

    try {
        const session = await auth();
        if (!session?.user?.id) {
            throw new Error("Unauthorized: Please login");
        }

        // 1. Build Base Query (without expenses initially for list view performance)
        let baseQuery = buildBaseOrderQuery().$dynamic();

        // 2. Apply Filters
        let filteredQuery = applyFilters(baseQuery, filters, session.user.id, session.user.userType, session.user.customerId);

        // 3. Get Total Count
        const countQuery = db.select({ count: sql<number>`count(*)`.mapWith(Number) }).from(orders).$dynamic();
        const filteredCountQuery = applyFilters(countQuery, filters, session.user.id, session.user.userType, session.user.customerId);
        const totalResult = await filteredCountQuery;
        const totalCount = totalResult[ 0 ]?.count ?? 0;

        // 4. Apply Sorting and Pagination
        let sortedQuery = applySort(filteredQuery, sort);
        let paginatedQuery = applyPagination(sortedQuery, page, pageSize);

        // 5. Execute Main Query
        const rawOrders = await paginatedQuery;

        // 6. Map Results (Expenses will be empty here, fetched separately if needed)
        const mappedOrders = rawOrders.map(mapRawOrderToSchema);

        const pagination: Pagination = {
            total: totalCount,
            pageSize,
            currentPage: page,
            totalPages: Math.ceil(totalCount / pageSize)
        };

        return {
            orders: mappedOrders,
            pagination: pagination
        };

    } catch (error: any) {
        console.error('Error in fetchOrders:', error);
        throw new Error("Failed to fetch orders");
    }
}


export async function fetchOrderById(orderId: string): Promise<ApiResponse<EnrichedOrderSchemaType>> {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return { success: false, message: "Unauthorized: Must be logged in to fetch order." };
        }

        const rawQuery = sql<EnrichedOrderSchemaType>`
            SELECT
                ${orders}.*,
                ${customers}.display_name as "displayName",
                ${users}.first_name as "creatorFirstName",
                ${users}.last_name as "creatorLastName",
                ${users}.user_type as "creatorUserType",
                COALESCE(json_agg(DISTINCT
                    CASE WHEN ${items}.item_id IS NOT NULL THEN
                        jsonb_build_object(
                            'itemId', ${items}.item_id,
                            'itemName', ${items}.item_name,
                            'quantity', ${orderItems}.quantity,
                            'itemLocationId', ${orderItems}.item_location_id
                        )
                    END
                ) FILTER (WHERE ${items}.item_id IS NOT NULL), '[]') AS items,
                COALESCE(json_agg(DISTINCT
                    CASE WHEN ${expenseItems}.expense_item_id IS NOT NULL THEN
                        jsonb_build_object(
                            'orderExpenseId', ${orderExpenses}.order_expense_id,
                            'expenseItemId', ${expenseItems}.expense_item_id,
                            'expenseItemQuantity', ${orderExpenses}.expense_item_quantity,
                            'notes', ${orderExpenses}.notes,
                            'status', ${orderExpenses}.status,
                            'createdBy', ${orderExpenses}.created_by,
                            'createdAt', ${orderExpenses}.created_at,
                            'updatedAt', ${orderExpenses}.updated_at,
                            'expenseName', ${expenseItems}.expense_name,
                            'expensePrice', ${expenseItems}.expense_price,
                            'expenseCategory', ${expenseItems}.expense_category
                        )
                    END
                ) FILTER (WHERE ${expenseItems}.expense_item_id IS NOT NULL), '[]') AS expenses
            FROM ${orders}
            LEFT JOIN ${customers} ON ${orders}.customer_id = ${customers}.customer_id
            LEFT JOIN ${orderItems} ON ${orders}.order_id = ${orderItems}.order_id
            LEFT JOIN ${items} ON ${orderItems}.item_id = ${items}.item_id
            LEFT JOIN ${users} ON ${orders}.created_by = ${users}.user_id
            LEFT JOIN ${orderExpenses} ON ${orders}.order_id = ${orderExpenses}.order_id
            LEFT JOIN ${expenseItems} ON ${orderExpenses}.expense_item_id = ${expenseItems}.expense_item_id
            WHERE ${orders}.order_id = ${orderId}
            GROUP BY ${orders}.order_id, ${customers}.customer_id, ${users}.user_id
        `;

        const results = await db.execute(rawQuery);

        if (!results?.rows || !Array.isArray(results.rows) || results.rows.length === 0) {
            return { success: false, message: 'Order not found' };
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
            // fulfilledAt: order.fulfilledAt ? new Date(order.fulfilled_at.toString()) : null,
            fulfilledAt: order.fulfilledAt,
            notes: order.notes || null,
            createdBy: order.created_by,
            createdAt: order.created_at ? new Date(order.created_at.toString()) : new Date(),
            updatedAt: order.updated_at ? new Date(order.updated_at.toString()) : null,
            isDeleted: Boolean(order.is_deleted),
            customerName: order.displayName || 'Unknown Customer',
            zohoInvoiceID: order.zoho_invoice_id || null,
            zohoInvoiceNumber: order.zoho_invoice_number || null,
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
                : [],
            expenses: Array.isArray(order.expenses)
                ? order.expenses.map((expense: any) => ({
                    orderId: orderId,
                    orderExpenseId: expense.orderExpenseId,
                    expenseItemId: expense.expenseItemId,
                    expenseItemQuantity: Number(expense.expenseItemQuantity) || 0,
                    notes: expense.notes || null,
                    status: expense.status,
                    createdBy: expense.createdBy || null, // Assuming createdBy can be null
                    createdAt: expense.createdAt ? new Date(expense.createdAt.toString()) : new Date(),
                    updatedAt: expense.updatedAt ? new Date(expense.updatedAt.toString()) : null,
                    expenseName: expense.expenseName || '',
                    expensePrice: Number(expense.expensePrice) || 0,
                    expenseCategory: expense.expenseCategory || null,
                })).filter(expense => expense.expenseItemId)
                : [],
        };

        // console.log(enrichedOrder)
        const parsedOrder = EnrichedOrderSchema.parse(enrichedOrder);
        return { success: true, data: parsedOrder };
    } catch (error) {
        console.error('Error in getOrderById:', error);
        return { success: false, message: 'Failed to fetch order' };
    }
}

export async function createOrderInDb(inputData: CreateOrderSchemaType): Promise<ApiResponse<EnrichedOrderSchemaType>> {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return { success: false, message: "Unauthorized: Must be logged in." };
        }

        // 1. Validate Input Data
        const validatedFields = CreateOrderSchema.safeParse({
            ...inputData,
            createdBy: session.user.id
        });

        if (!validatedFields.success) {
            console.error("Validation Error (createOrderInDb):", validatedFields.error.format());
            const firstError = validatedFields.error.errors[ 0 ];
            const errorMessage = `Invalid input: ${firstError?.path.join('.')} - ${firstError?.message}`;
            return { success: false, message: errorMessage || "Invalid input data" };
        }

        const orderDataPayload = validatedFields.data;

        // 2. Database Transaction
        const result = await db.transaction(async (tx) => {

            // 2a. Stock Pre-Check (if applicable)
            if (orderDataPayload.status === 'COMPLETED' && orderDataPayload.movement === 'OUT') {
                const requiredStock = orderDataPayload.items.map(item => ({
                    itemId: item.itemId,
                    requiredQuantity: item.quantity,
                }));

                if (requiredStock.length > 0) {
                    const itemIds = requiredStock.map(item => item.itemId);
                    const currentStockLevels = await tx.select({
                        itemId: itemStock.itemId,
                        available: itemStock.currentQuantity,
                        itemName: items.itemName
                    })
                        .from(itemStock)
                        .innerJoin(items, eq(itemStock.itemId, items.itemId))
                        .where(inArray(itemStock.itemId, itemIds));

                    const stockMap = new Map(currentStockLevels.map(s => [ s.itemId, s.available ]));
                    const itemNameMap = new Map(currentStockLevels.map(s => [ s.itemId, s.itemName ]));

                    for (const item of requiredStock) {
                        const available = stockMap.get(item.itemId) ?? 0;
                        const itemName = itemNameMap.get(item.itemId) ?? 'Unknown Item';
                        if (available < item.requiredQuantity) {
                            throw new Error(`Insufficient stock for ${itemName}. Required: ${item.requiredQuantity}, Available: ${available}`);
                        }
                    }
                    console.log("Stock pre-check passed for createOrderInDb.");
                }
            }

            // 2b. Insert Order Header
            const initialStatus = orderDataPayload.status === 'COMPLETED' ? 'PENDING' : orderDataPayload.status;
            const [ newOrderHeader ] = await tx.insert(orders).values({
                customerId: orderDataPayload.customerId,
                orderType: orderDataPayload.orderType,
                movement: orderDataPayload.movement,
                packingType: orderDataPayload.packingType,
                deliveryMethod: orderDataPayload.deliveryMethod,
                status: initialStatus,
                addressId: orderDataPayload.addressId,
                notes: orderDataPayload.notes,
                createdBy: orderDataPayload.createdBy
            }).returning({ orderId: orders.orderId });

            // 2c. Insert Order Items
            if (orderDataPayload.items && orderDataPayload.items.length > 0) {
                const orderItemsData = orderDataPayload.items.map(item => ({
                    orderId: newOrderHeader.orderId,
                    itemId: item.itemId,
                    quantity: item.quantity,
                    itemLocationId: item.itemLocationId
                }));
                await tx.insert(orderItems).values(orderItemsData);
            } else {
                console.warn(`Order ${newOrderHeader.orderId} created with no items.`);
            }


            // 2d. Update Status to COMPLETED (if needed)
            if (orderDataPayload.status === 'COMPLETED') {
                await tx.update(orders)
                    .set({ status: 'COMPLETED' })
                    .where(eq(orders.orderId, newOrderHeader.orderId));
                console.log(`Order ${newOrderHeader.orderId} status updated to COMPLETED post-transaction.`);
            }

            // 2e. Fetch the complete order data for the response
            const finalOrderQuery = buildBaseOrderQuery(tx)
                .where(eq(orders.orderId, newOrderHeader.orderId))
                .$dynamic();
            const finalOrderResult = await finalOrderQuery;

            if (!finalOrderResult || finalOrderResult.length === 0) {
                throw new Error("Failed to retrieve the newly created order details within transaction.");
            }

            return mapRawOrderToSchema(finalOrderResult[ 0 ]);
        });

        // 3. Validate Final Output
        const validatedResult = EnrichedOrderSchema.safeParse(result);
        if (!validatedResult.success) {
            console.error("Data validation error (createOrderInDb response):", JSON.stringify(validatedResult.error.issues, null, 2));
            return { success: false, message: "Order created, but failed to return valid data structure." };
        }

        return { success: true, message: "Order created successfully", data: validatedResult.data };

    } catch (error: any) {
        console.error('Error in createOrderInDb:', error);
        if (error.message.includes("Insufficient stock")) {
            return { success: false, message: error.message };
        }
        return { success: false, message: error.message || 'Failed to create order' };
    }
}


export async function updateOrderInDb(inputData: UpdateOrderSchemaType): Promise<ApiResponse<EnrichedOrderSchemaType>> {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return { success: false, message: "Unauthorized: Must be logged in." };
        }

        // 1. Validate Input Data
        const validatedFields = UpdateOrderSchema.safeParse(inputData);

        if (!validatedFields.success) {
            console.error("Validation Error (updateOrderInDb):", validatedFields.error.format());
            const firstError = validatedFields.error.errors[ 0 ];
            const errorMessage = `Invalid input: ${firstError?.path.join('.')} - ${firstError?.message}`;
            return { success: false, message: errorMessage || "Invalid input data for update" };
        }

        const updateData = validatedFields.data;

        if (!updateData.orderId) {
            return { success: false, message: "Order ID is required for update." };
        }

        // 2. Database Transaction
        const result = await db.transaction(async (tx) => {
            // 2a. Fetch Existing Order
            const [ existingOrder ] = await tx.select({
                status: orders.status,
                customerId: orders.customerId,
                createdBy: orders.createdBy
            })
                .from(orders)
                .where(eq(orders.orderId, updateData.orderId as string));

            if (!existingOrder) {
                throw new Error(`Order with ID ${updateData.orderId} not found.`);
            }

            // Authorization checks
            if (session.user.userType === 'CUSTOMER' && existingOrder.customerId !== session.user.customerId) {
                throw new Error("Permission denied: Cannot update this order.");
            }

            // 2b. Stock Pre-Check
            const isBecomingCompletedOut = updateData.status === 'COMPLETED' && existingOrder.status !== 'COMPLETED' && updateData.movement === 'OUT';
            if (isBecomingCompletedOut && updateData.items && updateData.items.length > 0) {
                console.log("Performing stock pre-check for updateOrderInDb...");
                // ... (Stock check implementation needed)
            }


            // 2c. Update Order Header
            const [ updatedOrderHeader ] = await tx
                .update(orders)
                .set({
                    ...(updateData.status && { status: updateData.status === 'COMPLETED' ? 'PENDING' : updateData.status }),
                    ...(updateData.movement && { movement: updateData.movement }),
                    ...(updateData.packingType && { packingType: updateData.packingType }),
                    ...(updateData.deliveryMethod && { deliveryMethod: updateData.deliveryMethod }),
                    ...(updateData.notes !== undefined && { notes: updateData.notes }),
                    ...(updateData.orderMark !== undefined && { orderMark: updateData.orderMark }),
                    updatedAt: new Date(),
                })
                .where(eq(orders.orderId, updateData.orderId as string))
                .returning({ orderId: orders.orderId });

            if (!updatedOrderHeader) {
                throw new Error('Order update failed: Order not found during update operation.');
            }

            // 2d. Update Order Items
            if (updateData.items && Array.isArray(updateData.items)) {
                console.log(`Updating items for order ${updateData.orderId}...`);
                await tx
                    .delete(orderItems)
                    .where(eq(orderItems.orderId, updateData.orderId as string));

                if (updateData.items.length > 0) {
                    const orderItemsData = updateData.items.map(item => ({
                        orderId: updateData.orderId as string,
                        itemId: item.itemId,
                        quantity: item.quantity,
                        itemLocationId: item.itemLocationId
                    }));
                    await tx.insert(orderItems).values(orderItemsData);
                    console.log(`${orderItemsData.length} items inserted for order ${updateData.orderId}.`);
                } else {
                    console.log(`All items removed for order ${updateData.orderId}.`);
                }
            }

            // 2e. Final Status Update
            if (updateData.status === 'COMPLETED') {
                await tx.update(orders)
                    .set({ status: 'COMPLETED' })
                    .where(eq(orders.orderId, updateData.orderId as string));
                console.log(`Order ${updateData.orderId} status updated to COMPLETED post-update transaction.`);
            }


            // 2f. Fetch the complete updated order data
            const finalOrderQuery = buildBaseOrderQuery(tx)
                .where(eq(orders.orderId, updateData.orderId as string))
                .$dynamic();
            const finalOrderResult = await finalOrderQuery;

            if (!finalOrderResult || finalOrderResult.length === 0) {
                throw new Error("Failed to retrieve the updated order details within transaction.");
            }

            return mapRawOrderToSchema(finalOrderResult[ 0 ]);
        });

        // 3. Validate Final Output
        const validatedResult = EnrichedOrderSchema.safeParse(result);
        if (!validatedResult.success) {
            console.error("Data validation error (updateOrderInDb response):", JSON.stringify(validatedResult.error.issues, null, 2));
            return { success: false, message: "Order updated, but failed to return valid data structure." };
        }

        return { success: true, message: "Order updated successfully", data: validatedResult.data };

    } catch (error: any) {
        console.error('Error in updateOrderInDb:', error);
        if (error.message.includes("Insufficient stock") || error.message.includes("Permission denied") || error.message.includes("not found")) {
            return { success: false, message: error.message };
        }
        return { success: false, message: error.message || 'Failed to update order' };
    }
}






export async function createOrderExpenseInDb(inputData: createOrderExpenseSchemaType): Promise<ApiResponse<orderExpenseSchemaType>> {
    try {
        // 1. Validate Input Delta Structure
        const validatedSchema = createOrderExpenseSchema.safeParse(inputData);
        if (!validatedSchema.success) {
            console.error("Validation Error (createOrderExpenseInDb delta input):", validatedSchema.error.format());
            return { success: false, message: "Invalid input data format." };
        }
        const validatedDelta = validatedSchema.data;

        // 2. Handle Empty Delta (Indicates no changes were submitted)
        if (validatedDelta.length === 0) {
            console.warn("createOrderExpenseInDb called with empty delta array. No action taken.");
            // Return success because no changes needed to be applied
            return { success: true, message: "No changes submitted." };
        }

        // 3. Get Order ID (Ensure consistency if multiple items in delta)
        // It's safer to check if all items in the delta belong to the same order.
        const orderId = validatedDelta[ 0 ]?.orderId;
        if (!orderId) {
            return { success: false, message: "Missing orderId in expense data." };
        }
        // Optional: Add check for consistent orderId across delta items if needed
        const allSameOrder = validatedDelta.every(item => item.orderId === orderId);
        if (!allSameOrder) {
            return { success: false, message: "Delta contains items for multiple orders." };
        }

        // 4. Separate Delta Items
        const itemsToUpsert = validatedDelta.filter(item => item.expenseItemQuantity > 0);
        const itemsMarkedForDelete = validatedDelta.filter(item => item.expenseItemQuantity === 0 && item.orderExpenseId);
        const idsMarkedForDelete: string[] = itemsMarkedForDelete.map(item => item.orderExpenseId as string); // Extract IDs for deletion

        // 5. Database Transaction
        await db.transaction(async (tx) => {
            // 5a. Upsert items with quantity > 0 from the DELTA
            if (itemsToUpsert.length > 0) {
                const valuesToUpsert = itemsToUpsert.map(item => ({
                    ...item,
                    orderExpenseId: item.orderExpenseId ?? undefined, // Let DB handle default/null for new items
                    expenseItemQuantity: item.expenseItemQuantity, // Set quantity for existing/new
                }));

                await tx.insert(orderExpenses)
                    .values(valuesToUpsert)
                    .onConflictDoUpdate({
                        target: orderExpenses.orderExpenseId, // Target PK
                        set: { // Define updates for existing items
                            expenseItemId: sql`excluded.expense_item_id`,
                            expenseItemQuantity: sql`excluded.expense_item_quantity`,
                            notes: sql`excluded.notes`,
                            updatedAt: new Date(),
                            // Do NOT update orderId or createdBy on conflict
                        }
                    });
                console.log(`Upserted ${valuesToUpsert.length} expense items from delta for order ${orderId}.`);
            } else {
                console.log(`No items to upsert in delta for order ${orderId}.`);
            }

            // 5b. Delete items explicitly marked in the DELTA (quantity 0)
            if (idsMarkedForDelete.length > 0) {
                const deleteResult = await tx.delete(orderExpenses).where(
                    and(
                        eq(orderExpenses.orderId, orderId), // Ensure deletion is scoped to the correct order
                        inArray(orderExpenses.orderExpenseId, idsMarkedForDelete) // Only delete items explicitly marked
                    )
                ).returning({ id: orderExpenses.orderExpenseId });
                console.log(`Deleted ${deleteResult.length} expense items explicitly marked in delta for order ${orderId}.`);
            } else {
                console.log(`No items marked for deletion in delta for order ${orderId}.`);
            }

            // REMOVED: The complex logic trying to delete items *not* in the payload.

            // 5c. Refresh Materialized View (Still needed after changes)
            await tx.refreshMaterializedView(orderExpenseDetailsMaterializedView);
            console.log(`Refreshed materialized view for order ${orderId}.`);
        });

        // 6. Return Success
        console.log(`Successfully processed expense delta for order ${orderId}.`);
        return { success: true, message: "Order expenses updated successfully." };

    } catch (error: any) {
        console.error(`Error processing expense delta for order ${inputData[ 0 ]?.orderId}:`, error);
        const message = error.message || "An unexpected error occurred.";
        return { success: false, message: `Failed to update order expenses: ${message}` };
    }
}

export async function DBSearchOrders(searchParams: DBSearchOrderParams): Promise<ApiResponse<OrderSchemaType[]>> {
    try {
        let rawData;

        if (searchParams.orderIds) {
            rawData = await db.select().from(orders)
                .where(inArray(orders.orderId, searchParams.orderIds))
        } else if (searchParams.customerId) {
            rawData = await db.select().from(orders)
                .where(eq(orders.customerId, searchParams.customerId))
        } else {
            return { success: true, data: [] }; // Return empty array if no search params are provided
        }

        console.log(rawData);
        const parse = z.array(OrderSchema).safeParse(rawData)
        if (!parse.success) {
            console.error("Data validation error");
            return { success: false, message: "Invalid Order data structure received from database" }
        }
        return { success: true, data: parse.data }

    } catch (error) {
        if (error instanceof Error) {
            console.error("Error fetching orders:", error.message);
            return { success: false, message: "Error fetching orders" }
        } else {
            console.error("An unexpected error occurred:", error);
            return { success: false, message: "An unexpected error occurred while fetching orders" }
        }
    }
};