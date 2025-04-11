'use server'

import { auth } from "@/lib/auth/auth"
import { createItemInDb, fetchItems } from "@/server/queries/items-queries";
import { CreateItemsSchemaType, ItemResponse, ItemSchemaType } from "@/types/items";
import { withAuth } from "./auth-check";
import { User } from "next-auth";
import { ApiResponse } from "@/types/common";


export async function getItems(): Promise<ApiResponse<ItemSchemaType[]>>  {

    const session = await auth();
    if (!session?.user) {
        return { success: false, message: "Unauthorized - No session or user found" };
    }
    const { user } = session;
    const { userType, customerId } = user;
    console.log(userType, customerId)
    if (userType === "CUSTOMER" && !customerId) {
        // throw new Error("No Customer ID");
        return { success: false, message: "Unauthorized - Customer ID missing" };
    }
    let items;
    switch (userType) {
        case 'EMPLOYEE':
            items = await fetchItems();
            return { success: true, data: items };
        case 'CUSTOMER':
            items = await fetchItems(customerId);
            return { success: true, data: items };
        case 'DEMO':
            return { success: false, message: "DEMO ACCOUNT NOT IMPLEMENTED" };
        default:
            return { success: false, message: "Unauthorized - Unknown user type" };
    }
}

// Use async/await pattern with withAuth
export async function createItem(itemData: CreateItemsSchemaType): Promise<ApiResponse<ItemSchemaType>> {
    // First await the withAuth call to get the handler function
    const authHandler = await withAuth(async (user: User, data: CreateItemsSchemaType): Promise<ApiResponse<ItemSchemaType>> => {
        const { userType, customerId, id } = user;

        if (id !== data.createdBy) {
            return { success: false, message: "Unauthorized" };
        }
        if (userType === 'CUSTOMER') {
            if (customerId !== data.customerId) {
                return { success: false, message: "Unauthorized - Customer ID mismatch" };
            }
            return await createItemInDb(data);
        }
        if (userType === 'EMPLOYEE') {
            return await createItemInDb(data);
        }
        return { success: false, message: "Unauthorized" };
    });
    
    // Then call the handler with the data
    return authHandler(itemData);
}

// Fix updateItem function the same way
export async function updateItem(itemData: any): Promise<ApiResponse<ItemSchemaType>> {
    const authHandler = await withAuth(async (user, data) => {
        // Authorization check (can this user edit this item?)
        // Validation logic
        // Business rules enforcement
        // Call updateItemInDb from repository
        return { success: true };
    });
    
    return authHandler(itemData);
}


