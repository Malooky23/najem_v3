import { z } from "zod";
import { type InsertItem, items, type Item } from "@/server/db/schema";
import {createInsertSchema,} from 'drizzle-zod'
import {  } from "@/server/actions/actn_stockMovements";
import { stockMovement, stockReconciliation } from "./stockMovement";

export const emptyStringToNull = z.string().optional().nullable().nullish().transform((val) => val === '' ? null : val);



export const itemTypes = z.enum(["SACK", "PALLET", "CARTON", "OTHER", "BOX", "EQUIPMENT", "CAR"])

export const itemStock = z.object({
  itemId: z.string(),
  locationId: z.string(),
  currentQuantity: z.number().nonnegative(),
  lastUpdated: z.date(),
  lastMovementId: z.string().nullable(),
  lastReconciliationAt: z.date().nullable(),
  lastReconciliationBy: z.string().nullable(),
});
// New schema for stock reconciliation



export const createItemsSchema = z.object({
  itemType: itemTypes,
  itemName: z.string().min(3, {message:"Item Name too short, min 3 characters"}),
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

});

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
  notes: z.string().nullable(),
  createdBy: z.string(),
  createdAt: z.date(),
  updatedAt: z.date().nullable(),
  isDeleted: z.boolean().default(false),
  itemStock: z.array(itemStock).nullable().optional(),
  stockMovements: z.array(stockMovement).optional(),
  stockReconciliations: z.array(stockReconciliation).optional(),
});


export const EnrichedItemsSchema = ItemSchema.extend({
  customerDisplayName: z.string(), // Add the new field here, define its type
});

export type ItemSchemaType = z.infer< typeof ItemSchema>
export type EnrichedItemsType = z.infer< typeof EnrichedItemsSchema>
// export type CreateItemsSchemaType = z.infer< typeof createItemsSchema>


export type CreateItemsSchemaType = z.infer< typeof createItemsSchema>
export const insertItemZod = createInsertSchema(items)

