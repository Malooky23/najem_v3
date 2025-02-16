// src/server/services/item-service.ts
import { db } from '@/server/db'; // Assuming you have db initialized in '@/server/db/index.ts'
import { ItemSchema, ItemSchemaType } from '@/types/items';
import { z } from 'zod';

export const itemService = {
    async getAllItems(): Promise<ItemSchemaType[]> {
        try {
            const rawItems =  await db.query.items.findMany();
            const parsedItems = z.array(ItemSchema).parse(rawItems);
            return parsedItems;
        } catch (error) {
            if (error instanceof z.ZodError) {
                console.error("Data validation error:", JSON.stringify(error.errors, null, 2));
                throw new Error("Invalid data structure received from database");
            }
            console.error("Database query error:", error);
            throw new Error("Failed to fetch items");
        }
    },
    // ... you can add more item-related service functions here later
};