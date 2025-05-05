import { z } from "zod";
import { items, itemTypesSchema } from "@/server/db/schema";
import {createInsertSchema,} from 'drizzle-zod'
import { stockMovement, stockReconciliation, stockMovementsView } from "./stockMovement";


export const emptyStringToNull = z.string().optional().nullable().nullish().transform((val) => val === '' ? null : val);


export type ItemFilterState = {
  types: string[]
  customers: string[]
  selectedItems: string[]
}

export const itemStock = z.object({
  itemId: z.string(),
  locationId: z.string(),
  currentQuantity: z.number(),
  lastUpdated: z.date(),
  lastMovementId: z.string().nullable(),
  lastReconciliationAt: z.date().nullable(),
  lastReconciliationBy: z.string().nullable(),
});

export const createItemsSchema = z.object({
  itemType: itemTypesSchema,
  itemName: z.string().min(2, {message:"Item Name too short, min 3 characters"}),
  itemBrand: emptyStringToNull,
  itemModel: emptyStringToNull,
  itemBarcode: emptyStringToNull,
  itemCountryOfOrigin: emptyStringToNull,
  weightGrams: z.coerce.number().nonnegative().optional().nullable(),
  dimensions: z
  .object({
    width: z.coerce.number().nonnegative().optional(),
    height: z.coerce.number().nonnegative().optional(),
    length: z.coerce.number().nonnegative().optional(),
  })
  .optional().nullable(),
  customerId: z.string().min(35, {message: "please select a customer"}),
  notes: emptyStringToNull,
  createdBy: z.string(),
  allowNegative: z.boolean().default(false).optional(),
  isDeleted: z.boolean().default(false).optional(),
});
export type CreateItemsSchemaType = z.infer<typeof createItemsSchema>


export const ItemSchema = z.object({
  itemId: z.string(),
  itemNumber: z.number(),
  itemName: z.string(),
  itemType: z.string().nullable(),
  itemBrand: z.string().nullable(),
  itemModel: z.string().nullable(),
  itemBarcode: z.string().nullable(),
  itemCountryOfOrigin: z.string().nullable(),
  dimensions: z.object({
    width: z.coerce.number().optional().nullable(),
    height: z.coerce.number().optional().nullable(),
    length: z.coerce.number().optional().nullable(),
  }).optional().nullable(),
  weightGrams: z.coerce.number().nullable(),
  customerId: z.string(),
  customerDisplayName: z.string().optional(),
  notes: z.string().nullable(),
  createdBy: z.string(),
  createdAt: z.date(),
  updatedAt: z.date().nullable(),
  isDeleted: z.boolean().default(false).optional(),
  allowNegative: z.boolean().default(false).optional(),

  itemStock: z.array(itemStock).nullable().optional(),
  stockMovements: z.array(stockMovementsView).optional(), // Changed to use enriched view
  stockReconciliations: z.array(stockReconciliation).optional(),
});
export type ItemSchemaType = z.infer<typeof ItemSchema>


// export const EnrichedItemsSchema = ItemSchema.extend({
//   customerDisplayName: z.string(),
// });
// export type EnrichedItemsType = z.infer<typeof EnrichedItemsSchema>

export const UpdateItemSchema = createItemsSchema.extend({
  itemId: z.string(),
});
export type UpdateItemSchemaType = z.infer<typeof UpdateItemSchema>;

export const insertItemZod = createInsertSchema(items)



export type ItemResponse = {
    success: boolean,
    message?: string,
    data?: ItemSchemaType[] | ItemSchemaType,
}