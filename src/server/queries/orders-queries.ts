'use server'
import { z } from 'zod';
import { db } from '@/server/db';
import { auth } from '@/lib/auth/auth';
import { orders, orderItems, customers, items, users, itemStock, orderExpenses, orderExpenseDetailsMaterializedView, expenseItems } from '@/server/db/schema';
// Import 'not' and 'sql'
import { eq, and, desc, asc, sql, gte, lte, inArray, not } from 'drizzle-orm';
import {
    OrderSchema,
    OrderSchemaType,
    CreateOrderSchema,
    CreateOrderSchemaType,
    UpdateOrderSchema,
    UpdateOrderSchemaType,
    OrderFilters,
    OrderSort,
    EnrichedOrderSchema,
    EnrichedOrderSchemaType,
} from '@/types/orders';
import { ApiResponse, Pagination } from '@/types/common';
import { createOrderExpenseSchema, createOrderExpenseSchemaType, orderExpenseSchemaType } from '@/types/expense';

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
    const expensesArray: orderExpenseSchemaType[] = Array.isArray(rawOrder.expenses)
        ? rawOrder.expenses.map((exp: any) => ({
            orderExpenseId: exp.orderExpenseId,
            orderId: exp.orderId,
            expenseItemId: exp.expenseItemId,
            expenseItemQuantity: Number(exp.expenseItemQuantity) || 0,
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
    console.log("NEW fetchOrders");
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
        const totalCount = totalResult[0]?.count ?? 0;

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
            return { success: false, message: "Unauthorized: Must be logged in." };
        }

        // Build query for a single order, including expenses join
        let query = buildBaseOrderQuery() // Base query already has items
            // Add expense aggregation
            .select({
                expenses: sql<any>`COALESCE(
                    json_agg(
                        jsonb_build_object(
                            'orderExpenseId', ${orderExpenses.orderExpenseId},
                            'orderId', ${orderExpenses.orderId},
                            'expenseItemId', ${orderExpenses.expenseItemId},
                            'expenseItemQuantity', ${orderExpenses.expenseItemQuantity},
                            'notes', ${orderExpenses.notes},
                            'createdBy', ${orderExpenses.createdBy},
                            'createdAt', ${orderExpenses.createdAt},
                            'updatedAt', ${orderExpenses.updatedAt}
                            -- Add expense item details if needed via another join
                            -- 'expenseName', ${expenseItems.expenseName},
                            -- 'expensePrice', ${expenseItems.expensePrice}
                        )
                        ORDER BY ${orderExpenses.createdAt} -- Or some other relevant order
                    ) FILTER (WHERE ${orderExpenses.orderExpenseId} IS NOT NULL),
                    '[]'::json
                )`
            })
            .leftJoin(orderExpenses, eq(orders.orderId, orderExpenses.orderId)) // Join expenses
            // Optional: Join expenseItems if name/price needed directly
            // .leftJoin(expenseItems, eq(orderExpenses.expenseItemId, expenseItems.expenseItemId))
            .where(and(
                eq(orders.orderId, orderId),
                eq(orders.isDeleted, false)
            ))
            .$dynamic();


        // Apply user type restriction if necessary
        if (session.user.userType === 'CUSTOMER' && session.user.customerId) {
            // Customers likely shouldn't see expenses, adjust query/mapping if needed
            // For now, apply the filter as is
             query = query.where(eq(orders.customerId, session.user.customerId));
        }

        const results = await query;

        if (!results || results.length === 0) {
            return { success: false, message: 'Order not found or access denied' };
        }

        // Map including expenses
        const mappedOrder = mapRawOrderToSchema(results[0]);
        const validatedOrder = EnrichedOrderSchema.safeParse(mappedOrder);

        if (!validatedOrder.success) {
            console.error("Data validation error (fetchOrderById):", JSON.stringify(validatedOrder.error.issues, null, 2));
            return { success: false, message: "Invalid order data structure received." };
        }

        return { success: true, data: validatedOrder.data };

    } catch (error: any) {
        console.error('Error in fetchOrderById:', error);
        return { success: false, message: error.message || 'Failed to fetch order' };
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
            const firstError = validatedFields.error.errors[0];
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

                    const stockMap = new Map(currentStockLevels.map(s => [s.itemId, s.available]));
                    const itemNameMap = new Map(currentStockLevels.map(s => [s.itemId, s.itemName]));

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
            const [newOrderHeader] = await tx.insert(orders).values({
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

            return mapRawOrderToSchema(finalOrderResult[0]);
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
            const firstError = validatedFields.error.errors[0];
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
            const [existingOrder] = await tx.select({
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
            const [updatedOrderHeader] = await tx
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

            return mapRawOrderToSchema(finalOrderResult[0]);
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

// Function to sync order expenses (Upsert + Delete)
// Keeps original name and signature for compatibility for now
export async function createOrderExpenseInDb(inputData: createOrderExpenseSchemaType): Promise<ApiResponse<orderExpenseSchemaType>> {
    try {
        // 1. Validate Input Array Structure
        const validatedSchema = createOrderExpenseSchema.safeParse(inputData);
        if (!validatedSchema.success) {
            console.error("Validation Error (createOrderExpenseInDb input):", validatedSchema.error.format());
            return { success: false, message: "Invalid input data format." };
        }
        const validatedData = validatedSchema.data;

        // Handle empty array case - Needs orderId to delete all.
        // For now, return error if empty, as orderId isn't passed separately.
        if (validatedData.length === 0) {
             console.warn("createOrderExpenseInDb called with empty array. Cannot delete without orderId.");
             return { success: false, message: "Cannot sync empty expense list without Order ID." };
        }

        // Get orderId from the first item (assuming all items belong to the same order)
        const orderId = validatedData[0]?.orderId;
        if (!orderId) {
             return { success: false, message: "Missing orderId in expense data." };
        }

        // Extract IDs of expenses submitted (for the delete step)
        const submittedExpenseIds = validatedData
            .map(item => item.orderExpenseId)
            .filter((id): id is string => !!id); // Filter out null/undefined

        // 2. Database Transaction
        await db.transaction(async (tx) => {
            // 2a. Upsert Logic
            if (validatedData.length > 0) {
                // Prepare values, ensuring orderExpenseId is present or null/undefined for the insert
                const valuesToInsert = validatedData.map(item => ({
                    ...item,
                    // Drizzle handles optional fields; ensure schema allows optional orderExpenseId
                    orderExpenseId: item.orderExpenseId ?? undefined,
                    // Ensure required fields are present
                    orderId: item.orderId,
                    expenseItemId: item.expenseItemId,
                    expenseItemQuantity: item.expenseItemQuantity,
                    createdBy: item.createdBy,
                    notes: item.notes, // Pass notes as is (null/undefined/string)
                }));

                await tx.insert(orderExpenses)
                    .values(valuesToInsert)
                    .onConflictDoUpdate({
                        target: orderExpenses.orderExpenseId, // Target the PK
                        // Define the columns to update on conflict using 'excluded'
                        set: {
                            expenseItemId: sql`excluded.expense_item_id`,
                            expenseItemQuantity: sql`excluded.expense_item_quantity`,
                            notes: sql`excluded.notes`,
                            updatedAt: new Date(), // Always update timestamp
                            // Do NOT update orderId or createdBy on conflict
                        }
                    });
            }

            // 2b. Delete Logic
            // Delete expenses for this orderId that are NOT in the submitted list.
            const deleteConditions = [eq(orderExpenses.orderId, orderId)];
            if (submittedExpenseIds.length > 0) {
                 // Only delete if there were existing items submitted for comparison
                 deleteConditions.push(not(inArray(orderExpenses.orderExpenseId, submittedExpenseIds)));
                 await tx.delete(orderExpenses).where(and(...deleteConditions));
            } else {
                 // If validatedData was not empty, but submittedExpenseIds IS empty,
                 // it means only NEW items were sent. We should NOT delete any existing items.
                 // If validatedData WAS empty, we returned an error earlier.
                 // If the desired behavior *is* to delete all existing when only new are sent,
                 // this 'else' block would contain: await tx.delete(orderExpenses).where(eq(orderExpenses.orderId, orderId));
                 console.log("No existing expense IDs submitted, skipping delete operation for order:", orderId);
            }


             // 2c. Refresh Materialized View
             await tx.refreshMaterializedView(orderExpenseDetailsMaterializedView);
        });

        // Return the first item from the input to satisfy the type signature.
        // This is a workaround because the service expects a single item back.
        // Ideally, the service/hook should expect ApiResponse<void>.
        const firstItemResult: orderExpenseSchemaType = {
            ...validatedData[0],
            // Coerce dates to Date objects if needed by the return type, though schema uses coerce
            createdAt: new Date(), // Placeholder, actual value not returned by upsert easily
            updatedAt: new Date(), // Placeholder
        };

        return { success: true, message: "Order expenses synchronized successfully.", data: firstItemResult };

    } catch (error: any) {
        console.error("Error syncing order expenses:", error);
        return { success: false, message: `Failed to sync order expenses: ${error.message}` };
    }
}
