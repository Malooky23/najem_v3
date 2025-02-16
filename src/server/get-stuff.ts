// 'use server';

// import { db } from "@/server/db";
// import { QUERIES } from "@/server/db/queries";
// import { customerSchema, type EnrichedCustomer } from "@/types/customer";
// import { ItemSchemaType, ItemSchema} from '@/types/items'
// import { z } from "zod";

// export async function getCustomers(): Promise<EnrichedCustomer[]> {
//   try {
//     const rawCustomers = await QUERIES.getAllCustomersFULL();
    
//     // Single point of validation and transformation
//     const validatedCustomers = z.array(customerSchema).parse(rawCustomers);
    
//     return validatedCustomers; // Data is now validated and transformed (includes displayName)
//   } catch (error) {
//     if (error instanceof z.ZodError) {
//       console.error("Data validation error:", JSON.stringify(error.errors, null, 2));
//       throw new Error("Invalid data structure received from database");
//     }
    
//     console.error("Database query error:", error);
//     throw new Error("Failed to fetch customers");
//   }
// }


// export async function getItems(): Promise<ItemSchemaType[]> {
// // export async function getItems()  {
//   try {

//     const rawItems =  await db.query.items.findMany();
//     // console.log(rawItems)
//     const parsedItems = z.array(ItemSchema).parse(rawItems);
//     // console.log(parsedItems)
//     return parsedItems;

//   } catch (error) {
//     if (error instanceof z.ZodError) {
//       console.error("Data validation error:", JSON.stringify(error.errors, null, 2));
//       throw new Error("Invalid data structure received from database");
//     }
    
//     console.error("Database query error:", error);
//     throw new Error("Failed to fetch customers");
//   }
// }