// export async function createOrder(formData: FormData): Promise<OrderActionResponse> {
//     try {
//         const session = await auth();
//         if (!session?.user?.id) {
//             return { success: false, error: "Unauthorized: Must be logged in to create orders." };
//         }

//         const validatedFields = createOrderSchema.safeParse({
//             customerId: formData.get('customerId'),
//             orderType: formData.get('orderType'),
//             movement: formData.get('movement'),
//             packingType: formData.get('packingType'),
//             deliveryMethod: formData.get('deliveryMethod'),
//             status: formData.get('status'),
//             addressId: formData.get('addressId'),
//             notes: formData.get('notes'),
//             items: JSON.parse(formData.get('items') as string)
//         });

//         if (!validatedFields.success) {
//             return { success: false, error: validatedFields.error.message };
//         }

//         const orderData = validatedFields.data;

//         // Start a transaction to insert order and items
//         const result = await db.transaction(async (tx) => {
//             const [newOrder] = await tx.insert(orders).values({
//                 customerId: orderData.customerId,
//                 orderType: orderData.orderType,
//                 movement: orderData.movement,
//                 packingType: orderData.packingType,
//                 deliveryMethod: orderData.deliveryMethod,
//                 status: orderData.status,
//                 addressId: orderData.addressId,
//                 notes: orderData.notes,
//                 createdBy: session?.user.id ?? ""
//             }).returning();

//             // Insert order items
//             const orderItemsData = orderData.items.map(item => ({
//                 orderId: newOrder.orderId,
//                 itemId: item.itemId,
//                 quantity: item.quantity
//             }));

//             await tx.insert(orderItems).values(orderItemsData);

//             return newOrder;
//         });

//         return { success: true, data: result };
//     } catch (error) {
//         console.error('Error in createOrder:', error);
//         return { success: false, error: 'Failed to create order' };
//     }
// }

// export async function updateOrder(formData: FormData): Promise<OrderActionResponse> {
//     try {
//         const session = await auth();
//         if (!session?.user?.id) {
//             return { success: false, error: "Unauthorized: Must be logged in to update orders." };
//         }

//         const validatedFields = updateOrderSchema.safeParse({
//             orderId: formData.get('orderId'),
//             status: formData.get('status'),
//             deliveryMethod: formData.get('deliveryMethod'),
//             packingType: formData.get('packingType'),
//             notes: formData.get('notes'),
//             addressId: formData.get('addressId'),
//             items: formData.get('items') ? JSON.parse(formData.get('items') as string) : undefined
//         });

//         if (!validatedFields.success) {
//             return { success: false, error: validatedFields.error.message };
//         }

//         const orderData = validatedFields.data;

//         // Start a transaction to update order and items
//         const result = await db.transaction(async (tx) => {
//             const [updatedOrder] = await tx
//                 .update(orders)
//                 .set({
//                     status: orderData.status,
//                     deliveryMethod: orderData.deliveryMethod,
//                     packingType: orderData.packingType,
//                     notes: orderData.notes,
//                     addressId: orderData.addressId,
//                     updatedAt: new Date()
//                 })
//                 .where(eq(orders.orderId, orderData.orderId))
//                 .returning();

//             // Update order items if provided
//             if (orderData.items) {
//                 // Delete existing items
//                 await tx
//                     .delete(orderItems)
//                     .where(eq(orderItems.orderId, orderData.orderId));

//                 // Insert new items
//                 const orderItemsData = orderData.items.map(item => ({
//                     orderId: orderData.orderId,
//                     itemId: item.itemId,
//                     quantity: item.quantity
//                 }));

//                 await tx.insert(orderItems).values(orderItemsData);
//             }

//             return updatedOrder;
//         });

//         return { success: true, data: result };
//     } catch (error) {
//         console.error('Error in updateOrder:', error);
//         return { success: false, error: 'Failed to update order' };
//     }
// }


// // export type GetOrderActionResponse = {
// //     success: boolean;
// //     data?: EnrichedOrders[];
// //     error?: string;
// // };

// // export async function getOrders(
// //     page: number = 1,
// //     pageSize: number = 10,
// //     filters: OrderFilters = {},
// //     sort: OrderSort = { field: 'createdAt', direction: 'desc' }
// // ): Promise<OrderActionResponse> {
// //     try {
// //         const session = await auth();
// //         if (!session?.user?.id) {
// //             return { success: false, error: "Unauthorized: Must be logged in to fetch orders." };
// //         }

// //         const offset = (page - 1) * pageSize;
// //         const whereConditions = [];

// //         // Apply filters
// //         if (filters.status) {
// //             whereConditions.push(eq(orders.status, filters.status));
// //         }
// //         if (filters.customerId) {
// //             whereConditions.push(eq(orders.customerId, filters.customerId));
// //         }
// //         if (filters.movement) {
// //             whereConditions.push(eq(orders.movement, filters.movement));
// //         }
// //         if (filters.dateRange) {
// //             whereConditions.push(
// //                 and(
// //                     sql`${orders.createdAt} >= ${filters.dateRange.from}`,
// //                     sql`${orders.createdAt} <= ${filters.dateRange.to}`
// //                 )
// //             );
// //         }

// //         // Build the query with joins
// //         // const query = db
// //         //     .select({
// //         //         order: orders,
// //         //         displayName: customers.displayName,
// //         //         items: ??,
// //         //         creator: {
// //         //             firstName: users.firstName,
// //         //             lastName: users.lastName,
// //         //         }
// //         //     })
// //         //     .from(orders)
// //         //     .leftJoin(customers, eq(orders.customerId, customers.customerId))
// //         //     .leftJoin(orderItems, eq(orders.orderId, orderItems.orderId))
// //         //     .leftJoin(items, eq(orderItems.itemId, items.itemId))
// //         //     .leftJoin(users, eq(orders.createdBy, users.userId));

// //             const query = db.query.orders.findMany({
// //             with: {
// //                 customer: { // Assuming you have a relation 'customer' defined in your 'orders' schema to 'customers'
// //                     columns: {
// //                         displayName: true, // Select only 'displayName' from 'customers'
// //                     },
// //                 },
// //                 orderItems: { // Assuming you have a relation 'orderItems' defined in 'orders' schema to 'orderItems'
// //                     with: {
// //                         item: { // Assuming you have a relation 'item' defined in 'orderItems' schema to 'items'
// //                             columns: {
// //                                 itemId: true,
// //                                 itemName: true,
// //                             },
// //                         },
// //                     },
// //                     columns: {
// //                         quantity: true, // Select 'quantity' from 'orderItems'
// //                     },
// //                 },
// //                 creator: { // Assuming you have a relation 'creator' defined in 'orders' schema to 'users'
// //                     columns: {
// //                         firstName: true,
// //                         lastName: true,
// //                     },
// //                 },
// //             },
// //         });


// //         if (whereConditions.length > 0) {
// //             query.where(and(...whereConditions));
// //         }

// //         // Apply sorting
// //         if (sort.field === 'createdAt') {
// //             query.orderBy(sort.direction === 'desc' ? desc(orders.createdAt) : asc(orders.createdAt));
// //         } else if (sort.field === 'orderNumber') {
// //             query.orderBy(sort.direction === 'desc' ? desc(orders.orderNumber) : asc(orders.orderNumber));
// //         } else if (sort.field === 'status') {
// //             query.orderBy(sort.direction === 'desc' ? desc(orders.status) : asc(orders.status));
// //         }

// //         // Apply pagination
// //         query.limit(pageSize).offset(offset);

// //         const results = await query;

// //         // Get total count for pagination
// //         const countQuery = db
// //             .select({ count: sql<number>`count(*)` })
// //             .from(orders);

// //         if (whereConditions.length > 0) {
// //             countQuery.where(and(...whereConditions));
// //         }

// //         const [{ count }] = await countQuery;

// //         return {
// //             success: true,
// //             data: {
// //                 orders: results,
// //                 pagination: {
// //                     total: count,
// //                     pageSize,
// //                     currentPage: page,
// //                     totalPages: Math.ceil(count / pageSize)
// //                 }
// //             }
// //         };
// //     } catch (error) {
// //         console.error('Error in getOrders:', error);
// //         return { success: false, error: 'Failed to fetch orders' };
// //     }
// // }

// // export type GetOrderActionResponse = {
// //     success: boolean;
// //     data?: {
// //         // orders: EnrichedOrders[];
// //         orders: any;
// //         pagination: {
// //             total: number;
// //             pageSize: number;
// //             currentPage: number;
// //             totalPages: number;
// //         };
// //     };
// //     error?: string;
// // };

// // export async function getOrders(
// //     page: number = 1,
// //     pageSize: number = 10,
// //     filters: OrderFilters = {},
// //     sort: OrderSort = { field: 'createdAt', direction: 'desc' }
// // ): Promise<GetOrderActionResponse> {
// //     try {
// //         const session = await auth();
// //         if (!session?.user?.id) {
// //             return { success: false, error: "Unauthorized: Must be logged in to fetch orders." };
// //         }

// //         const offset = (page - 1) * pageSize;

// //         // Build WHERE clause directly within findMany
// //         let query = db.query.orders
// //             .findMany({
// //                 where: and(
// //                     filters.status ? eq(orders.status, filters.status) : undefined,
// //                     filters.customerId ? eq(orders.customerId, filters.customerId) : undefined,
// //                     filters.movement ? eq(orders.movement, filters.movement) : undefined,
// //                     filters.dateRange ? and(gte(orders.createdAt, filters.dateRange.from), lte(orders.createdAt, filters.dateRange.to)) : undefined // Date range filter
// //                 ),
// //                 with: {
// //                     customer: {
// //                         columns: {
// //                             displayName: true,
// //                         },
// //                     },
// //                     orderItems: {
// //                         with: {
// //                             item: {
// //                                 columns: {
// //                                     itemId: true,
// //                                     itemName: true,
// //                                 },
// //                             },
// //                         },
// //                         columns: {
// //                             quantity: true,
// //                         },
// //                     },
// //                     creator: {
// //                         columns: {
// //                             firstName: true,
// //                             lastName: true,
// //                         },
// //                     },
// //                 },
// //                 limit: pageSize,
// //                 offset: offset,

// //             });

// //             query = query.where(and( // Reassign query after applying where
// //                 filters.status ? eq(orders.status, filters.status) : undefined,
// //                 filters.customerId ? eq(orders.customerId, filters.customerId) : undefined,
// //                 filters.movement ? eq(orders.movement, filters.movement) : undefined,
// //                 filters.dateRange ? and(gte(orders.createdAt, filters.dateRange.from), lte(orders.createdAt, filters.dateRange.to)) : undefined
// //             ));
    

// //         // Apply sorting - using Drizzle's `orderBy` directly on the query
// //         if (sort.field === 'createdAt') {
// //             query.orderBy(sort.direction === 'desc' ? desc(orders.createdAt) : asc(orders.createdAt));
// //         } else if (sort.field === 'orderNumber') {
// //             query.orderBy(sort.direction === 'desc' ? desc(orders.orderNumber) : asc(orders.orderNumber));
// //         } else if (sort.field === 'status') {
// //             query.orderBy(sort.direction === 'desc' ? desc(orders.status) : asc(orders.status));
// //         }


// //         const results = await query;

// //         // Transform the results to EnrichedOrders[] type
// //         const enrichedOrders: EnrichedOrders[] = results.map(orderResult => {
// //             const itemsArray = orderResult.orderItems.map(orderItem => ({
// //                 itemId: orderItem.item.itemId,
// //                 itemName: orderItem.item.itemName,
// //                 quantity: orderItem.quantity,
// //             }));

// //             return {
// //                 orderId: orderResult.order.orderId,
// //                 orderNumber: orderResult.order.orderNumber,
// //                 customerId: orderResult.order.customerId,
// //                 createdAt: orderResult.order.createdAt,
// //                 updatedAt: orderResult.order.updatedAt,
// //                 status: orderResult.order.status,
// //                 movement: orderResult.order.movement,
// //                 createdBy: orderResult.order.createdBy,
// //                 displayName: orderResult.customer?.displayName || 'Unknown Customer',
// //                 items: itemsArray,
// //                 creatorFirstName: orderResult.creator?.firstName || null,
// //                 creatorLastName: orderResult.creator?.lastName || null,
// //             } as EnrichedOrders;
// //         });


// //         // Get total count for pagination - apply WHERE clause directly to count query
// //         const countResult = await db
// //             .select({ count: sql<number>`count(*)` })
// //             .from(orders)
// //             .where(and(
// //                 filters.status ? eq(orders.status, filters.status) : undefined,
// //                 filters.customerId ? eq(orders.customerId, filters.customerId) : undefined,
// //                 filters.movement ? eq(orders.movement, filters.movement) : undefined,
// //                 filters.dateRange ? and(gte(orders.createdAt, filters.dateRange.from), lte(orders.createdAt, filters.dateRange.to)) : undefined // Date range filter
// //             ));


// //         const totalCount = countResult[0]?.count || 0;


// //         return {
// //             success: true,
// //             data: {
// //                 orders: enrichedOrders,
// //                 pagination: {
// //                     total: totalCount,
// //                     pageSize,
// //                     currentPage: page,
// //                     totalPages: Math.ceil(totalCount / pageSize)
// //                 }
// //             }
// //         };
// //     } catch (error) {
// //         console.error('Error in getOrders:', error);
// //         return { success: false, error: 'Failed to fetch orders' };
// //     }
// // }



// // export type GetOrderActionResponse = {
// //     success: boolean;
// //     data?: {
// //         orders: EnrichedOrders[];
// //         pagination: {
// //             total: number;
// //             pageSize: number;
// //             currentPage: number;
// //             totalPages: number;
// //         };
// //     };
// //     error?: string;
// // };

