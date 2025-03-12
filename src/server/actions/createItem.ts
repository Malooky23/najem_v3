
"use server"
import { number, z } from 'zod'
import { db } from '@/server/db'
import { sql } from 'drizzle-orm'
import { createItemsSchema, CreateItemsSchemaType, ItemSchema, ItemSchemaType, insertItemZod } from '@/types/items'
import { items } from '../db/schema'
import { boolean } from 'drizzle-orm/mysql-core'
import { auth } from '@/lib/auth/auth'
import useDelay from '@/hooks/useDelay'
import { error } from 'console'

// export type CreateItemResponse =
//     | { success: true, item: z.infer<typeof ItemSchema> }
//     | { success: false, error: string | { [x: string]: string[] } | undefined }; // Include undefined in error type
export type CreateItemResponse =
    {
        success: boolean,
        item?: z.infer<typeof ItemSchema>,
        error?: any
    }; // Include undefined in error type

    // export async function createItemAction(prevData: any, formData: FormData) {
export async function createItemAction(inputData: CreateItemsSchemaType): Promise<CreateItemResponse> {
// export async function createItemAction(formData: FormData) {
    // export const createItemAction = async (formData: any): Promise<CreateItemResponse> => {
   
   
    // await new Promise((resolve) => setTimeout(resolve, 2000))
   
    console.log("createItemAction inputData:", inputData);
    const session = await auth();
    if (!session?.user?.id) {
        return { success: false, error: "Unauthorized: Must be logged in to create items." };
    }

    // Handle authorization based on user type
    if (session.user.userType !== 'EMPLOYEE' && session.user.userType !== 'CUSTOMER') {
        return { success: false, error: "Unauthorized: Must be EMPLOYEE or CUSTOMER." };
    }

    // For CUSTOMER users, ensure they can only create items for themselves
    if (session.user.userType === 'CUSTOMER') {
        const requestedCustomerId = inputData.customerId;
        if (requestedCustomerId !== session.user.customerId) {
            throw new Error(JSON.stringify({ success: false, error: "Unauthorized: Customers can only create items for themselves." }));
        }
    }
    
    const validatedFields = createItemsSchema.safeParse(inputData)

    // const validatedFields = createItemsSchema.safeParse({
    //     itemName: formData.get('itemName'),
    //     itemType: (formData.get('itemType')),
    //     itemBrand: formData.get('itemBrand'),
    //     itemModel: formData.get('itemModel'),
    //     itemBarcode: formData.get('itemBarcode'),
    //     itemCountryOfOrigin: formData.get('itemCountryOfOrigin'),
    //     dimensions: {
    //         width: formData.get('dimensions.width'),
    //         height: formData.get('dimensions.height'),
    //         length: formData.get('dimensions.length')
    //     },
    //     weightGrams: formData.get('weightGrams'),
    //     customerId: formData.get('customerId'),
    //     notes: formData.get('notes'),
    //     createdBy: session.user.id // Set createdBy from session here on server-side
    // });

    try {
        if (!validatedFields.success) {
            console.log("Zod Validation Error:", validatedFields.error);
            const fieldErrors = validatedFields.error.flatten().fieldErrors;
            const errorMessage = `Zod Validation Failed: ${JSON.stringify(fieldErrors, null, 2)}`;
            return { success: false, error: fieldErrors }; // Return fieldErrors directly for field-level error display
        }
        const rawFormData = validatedFields.data;
        const dimensions = rawFormData.dimensions &&
            (!rawFormData.dimensions.width || !rawFormData.dimensions.height || !rawFormData.dimensions.length) ?
            null : rawFormData.dimensions;
        const payload = {
            itemName: rawFormData.itemName,
            itemType: rawFormData.itemType,
            itemBrand: rawFormData.itemBrand,
            itemModel: rawFormData.itemModel,
            itemBarcode: rawFormData.itemBarcode,
            itemCountryOfOrigin: rawFormData.itemCountryOfOrigin,
            dimensions: dimensions,
            weightGrams: rawFormData.weightGrams,
            customerId: rawFormData.customerId,
            notes: rawFormData.notes,
            createdBy: session.user.id // Use session user ID here
        };


        const dbAction = await db.insert(items).values(payload).returning(); // Use payload directly
        // const itemData = {
        //     ...dbAction[0],
        //     itemStock: [], // Initialize with empty array since it's a new item
        //     stockMovements: [], // Initialize with empty array
        //     stockReconciliations: [], // Initialize with empty array
        // };

        // const newItem = ItemSchema.safeParse(itemData);
        const newItem = ItemSchema.safeParse(dbAction[0]);


        if (newItem.success) {
            console.log("Database Insert Successful, Item:", newItem.data);
            return { success: true, item: newItem.data };
        } else {
            console.error("Item Schema Parsing Error (After DB Insert):", newItem.error);
            return { success: false, error: "Database operation successful, but item data parsing failed." };
        }


    } catch (e) {
        console.error('Error in createItemAction:', e);
        let errorMessage = "An unexpected error occurred while creating the item. Please try again.";
        if (e instanceof Error) {
            errorMessage += ` Details: ${e.message}`;
        }
        throw new Error(JSON.stringify({ success: false, error: { message: errorMessage } }));
    }
};
