// src/server/services/item-service.ts
import { db } from '@/server/db'; // Assuming you have db initialized in '@/server/db/index.ts'
import { ItemSchema, ItemSchemaType } from '@/types/items';
import { asc,eq } from 'drizzle-orm';
import { z } from 'zod';
import { items } from '../db/schema';

export const itemService = {
    async getAllItems(): Promise<ItemSchemaType[]> {
        try {
            const rawItems =  await db.query.items.findMany({
                orderBy: [asc(items.itemNumber)],
            });
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
    async getCustomerItems(customerId:string): Promise<ItemSchemaType[]> {
        try {
            const rawCustomerItems =  await db.query.items.findMany({
                where: eq(items.customerId, customerId),
                orderBy: [asc(items.itemNumber)],
            });
            const parsedItems = z.array(ItemSchema).parse(rawCustomerItems);
            console.log(parsedItems)
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
};