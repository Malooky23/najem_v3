'use server'
import { db } from '@/server/db'; // Assuming you have db initialized in '@/server/db/index.ts'
import { createItemsSchema, CreateItemsSchemaType, ItemSchema, ItemSchemaType } from '@/types/items';
import { and, desc, eq } from 'drizzle-orm';
import { z } from 'zod';
import { Customer, Item, items, stockMovementsView, } from '@/server/db/schema';
import { ApiResponse } from '@/types/common';

// Type to represent an Item with its relations. Used to map the raw data from the database to the Item Schema.
type RawItemWithRelations = Item & {
    customer: {
        displayName: Customer[ "displayName" ] | null | undefined;
    } | null | undefined;
};

export async function fetchItems(customerId?: string): Promise<z.infer<typeof ItemSchema>[]> {
    try {
        const whereConditions = [ eq(items.isDeleted, false) ];

        if (customerId) {
            whereConditions.push(eq(items.customerId, customerId));
        }

        const rawItems = await db.query.items.findMany({
            orderBy: [ desc(items.itemNumber) ],
            with: {
                itemStock: true,
                customer: {
                    columns: {
                        displayName: true,
                    },
                },
            },
            where: and(...whereConditions),
        });

        const parsedItems = rawItems.map((rawItem: RawItemWithRelations) => ({
            ...rawItem,
            customerDisplayName: rawItem.customer?.displayName,
        }));
        const validatedItems = z.array(ItemSchema).safeParse(parsedItems);

        if (!validatedItems.success) {
            console.error("Data validation error:", JSON.stringify(validatedItems.error.issues, null, 2));
            throw new Error("Invalid Items data structure received from database");
        }
        return validatedItems.data;
    } catch (error) {
        if (error instanceof Error) {
            console.error("Error fetching items:", error.message);
            throw new Error("Failed to fetch items");
        } else {
            console.error("An unexpected error occurred:", error);
            throw new Error("Failed to fetch items");
        }
    }
};

// --- NEW FUNCTION to fetch a single item with full details ---
export async function fetchItemById(itemId: string): Promise<ItemSchemaType | null> {
    if (!itemId) return null;

    //     try {
    //         // 1. Fetch the core item data, customer name, and current stock levels
    //         const rawItem = await db.query.items.findFirst({
    //             where: and(eq(items.itemId, itemId), eq(items.isDeleted, false)),
    //             with: {
    //                 customer: { // Fetch related customer
    //                     columns: {
    //                         displayName: true,
    //                     },
    //                 },
    //                 itemStock: true, // Fetch related stock levels
    //             },
    //         });

    //         // If item not found or deleted
    //         if (!rawItem) {
    //             console.log(`Item with ID ${itemId} not found.`);
    //             return null;
    //         }

    //         // 2. Fetch recent stock movements separately using the view
    //         // You might want to limit the number of movements fetched (e.g., last 20)
    //         const movements = await db.select()
    //             .from(stockMovementsView)
    //             .where(eq(stockMovementsView.itemId, itemId))
    //             .orderBy(desc(stockMovementsView.createdAt))
    //             .limit(50); // Example limit

    //         // 3. Combine the data
    //         const combinedData = {
    //             ...rawItem,
    //             customerDisplayName: rawItem.customer?.displayName,
    //             itemStock: rawItem.itemStock, // Already fetched
    //             stockMovements: movements, // Add the fetched movements
    //             // stockReconciliations: [], // Fetch reconciliations similarly if needed
    //         };

    //         // 4. Validate the combined data against the full ItemSchema
    //         const validatedItem = ItemSchema.safeParse(combinedData);

    //         if (!validatedItem.success) {
    //             console.error(`Data validation error for item ID ${itemId}:`, JSON.stringify(validatedItem.error.issues, null, 2));
    //             // Decide whether to throw or return null based on how strict you want to be
    //             // Returning null might be safer for the UI
    //             return null;
    //             // throw new Error(`Invalid Item data structure for ID ${itemId}`);
    //         }

    //         return validatedItem.data;

    //     } catch (error) {
    //         console.error(`Error fetching item by ID ${itemId}:`, error);
    //         // Handle specific errors if necessary
    //         // Returning null allows the UI to handle the "not found" or error case gracefully
    //         return null;
    //     }
    // }
    // --- END NEW FUNCTION ---
    try {
        const combinedDataResult = await db.transaction(async (tx) => {
            // 1. Fetch the core item data, customer name, and current stock levels
            // Use the transaction object 'tx' for the query
            const rawItem = await tx.query.items.findFirst({
                where: and(eq(items.itemId, itemId), eq(items.isDeleted, false)),
                with: {
                    customer: { // Fetch related customer
                        columns: {
                            displayName: true,
                        },
                    },
                    itemStock: true, // Fetch related stock levels
                },
            });

            // If item not found or deleted within the transaction, return null early
            if (!rawItem) {
                // Returning null from the transaction signifies not found
                return null;
            }

            // 2. Fetch recent stock movements separately using the view
            // Use the transaction object 'tx' for the query
            // You might want to limit the number of movements fetched (e.g., last 50)
            const movements = await tx.select()
                .from(stockMovementsView)
                .where(eq(stockMovementsView.itemId, itemId))
                .orderBy(desc(stockMovementsView.createdAt))
                .limit(50); // Example limit

            // 3. Combine the data before returning from the transaction
            const combinedData = {
                ...rawItem,
                customerDisplayName: rawItem.customer?.displayName,
                itemStock: rawItem.itemStock, // Already fetched
                stockMovements: movements, // Add the fetched movements
                // stockReconciliations: [], // Fetch reconciliations similarly if needed
            };

            // Return the combined data from the transaction
            return combinedData;

        }, { accessMode: 'read only' }); // Specify read-only access mode

        // Check if the transaction returned null (item not found or deleted)
        if (combinedDataResult === null) {
            console.log(`Item with ID ${itemId} not found or deleted.`);
            return null;
        }

        // 4. Validate the combined data against the full ItemSchema
        // This happens outside the transaction block
        const validatedItem = ItemSchema.safeParse(combinedDataResult);

        if (!validatedItem.success) {
            console.error(`Data validation error for item ID ${itemId}:`, JSON.stringify(validatedItem.error.issues, null, 2));
            // Decide whether to throw or return null based on how strict you want to be
            // Returning null might be safer for the UI
            return null;
            // throw new Error(`Invalid Item data structure for ID ${itemId}`);
        }

        return validatedItem.data;

    } catch (error) {
        console.error(`Error fetching item by ID ${itemId}:`, error);
        // Handle any errors that occurred during the transaction
        return null;
    }
}

export async function createItemInDb(inputData: CreateItemsSchemaType): Promise<ApiResponse<ItemSchemaType>> {
    try {
        const validatedFields = createItemsSchema.safeParse(inputData)
        if (!validatedFields.success) {
            return { success: false, message: "Invalid input data" };
        }
        const result = await db.insert(items).values(validatedFields.data).returning();

        if (result) {
            return { success: true, message: "Item created successfully", data: result[ 0 ] as ItemSchemaType };
        }

        return { success: false, message: "DB - Failed to create item" };

    } catch (error: any) {
        console.error("Error creating item:", error.message);
        return { success: false, message: "Failed to create item. Error: " + error.message };
    }

}

export async function updateItemInDb(inputData: CreateItemsSchemaType): Promise<ApiResponse<ItemSchemaType>> {

    return { success: false, message: "DB - Function not set up" };
}