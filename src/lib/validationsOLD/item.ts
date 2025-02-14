// import { z } from "zod";
// import { itemTypes } from "@/lib/types";

// export interface Item {
//   itemId: string;
//   itemNumber: number;
//   itemName: string;
//   itemType: string | null;
//   itemBrand: string | null;
//   itemModel: string | null;
//   itemBarcode: string | null;
//   dimensions: {
//     length?: number;
//     width?: number;
//     height?: number;
//   } | null;
//   weightGrams: number | null;
//   notes: string | null;
//   ownerId: string | null;
//   ownerName: string | null;
//   ownerType: string | null;
//   createdBy?: string | null;
//   createdAt?: Date;
//   updatedAt?: Date;
//   itemCountryOfOrigin: string | null;
//   packingType: string | null;
// }

// export const itemSchema = z.object({
//   itemName: z.string().min(1, "Required"),
//   itemType: z.string().optional(),
//   itemBrand: z.string().optional(),
//   itemModel: z.string().optional(),
//   itemBarcode: z.string().optional(),
//   itemCountryOfOrigin: z.string().optional(),
//   packingType: z.enum(['SACK', 'PALLET', 'CARTON', 'OTHER', 'NONE']),
//   weightGrams: z.number().nonnegative().optional(),
//   dimensions: z.object({
//     width: z.number().nonnegative(),
//     height: z.number().nonnegative(),
//     depth: z.number().nonnegative(),
//   }).optional(),
//   notes: z.string().optional(),
// });

// export const itemDimensionSchema = z.object({
//   length: z.number().min(0, "Length must be positive").optional(),
//   width: z.number().min(0, "Width must be positive").optional(),
//   height: z.number().min(0, "Height must be positive").optional(),
// });

// const baseItemSchema = z.object({
//   itemName: z.string().min(1, "Item name is required").max(50),
//   itemType: z.enum(itemTypes),
//   itemModel: z.string().max(100).nullish(),
//   itemBrand: z.string().max(100).nullish(),
//   weightGrams: z.number().int("Weight must be a whole number").min(0, "Weight must be positive").nullish(),
//   notes: z.string().max(1000).nullish(),
//   dimensions: itemDimensionSchema.nullish(),
//   itemBarcode: z.string().max(100).nullish(),
// });

// export const createItemSchema = baseItemSchema.extend({
//   ownerId: z.string().uuid("Invalid owner ID"),
//   ownerType: z.enum(["COMPANY", "CUSTOMER"]),
// });

// export const updateItemSchema = baseItemSchema.extend({
//   ownerId: z.string().uuid("Invalid owner ID").optional(),
//   ownerType: z.enum(["COMPANY", "CUSTOMER"]).optional(),
// }).partial();

// export type ItemDimension = z.infer<typeof itemDimensionSchema>;
// export type CreateItemInput = z.infer<typeof createItemSchema>;
// export type UpdateItemInput = z.infer<typeof updateItemSchema>;

// export const packingTypeOptions = ['SACK', 'PALLET', 'CARTON', 'OTHER', 'NONE'] as const;
