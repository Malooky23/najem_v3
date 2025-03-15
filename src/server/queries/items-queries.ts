'use server'
import { db } from '@/server/db'; // Assuming you have db initialized in '@/server/db/index.ts'
import { createItemsSchema, CreateItemsSchemaType, ItemResponse, ItemSchema, ItemSchemaType } from '@/types/items';
import { and, desc, eq } from 'drizzle-orm';
import { z } from 'zod';
import { Customer, Item, items, } from '@/server/db/schema';
import { ApiResponse } from '@/types/common';

// Type to represent an Item with its relations. Used to map the raw data from the database to the Item Schema.
type RawItemWithRelations = Item & {
    customer: {
        displayName: Customer["displayName"] | null | undefined;
    } | null | undefined;
};

export async function fetchItems(customerId?: string): Promise<z.infer<typeof ItemSchema>[]> {
    try {
        const whereConditions = [eq(items.isDeleted, false)];

        if (customerId) {
            whereConditions.push(eq(items.customerId, customerId));
        }

        const rawItems = await db.query.items.findMany({
            orderBy: [desc(items.itemNumber)],
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

export async function createItemInDb(inputData: CreateItemsSchemaType): Promise<ApiResponse<ItemSchemaType>> {
    try{
        const validatedFields = createItemsSchema.safeParse(inputData)
    if (!validatedFields.success) {
        return { success: false, message: "Invalid input data" };
    }
    const result = await db.insert(items).values(validatedFields.data).returning();
    console.log(result)
    if (result) {
        return { success: true, message: "Item created successfully", data: result[0] as ItemSchemaType };
    }

    return { success: false, message: "DB - Failed to create item" };

    }catch(error: any){
        console.error("Error creating item:", error.message);
        return { success: false, message: "Failed to create item. Error: " + error.message };
    }
    
}

export async function updateItemInDb(inputData: CreateItemsSchemaType): Promise<ApiResponse<ItemSchemaType>> {

    return { success: false, message: "DB - Function not set up" };
}