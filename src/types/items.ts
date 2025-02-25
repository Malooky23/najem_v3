import { z } from "zod";
import { type InsertItem, items, type Item } from "@/server/db/schema";
import {createInsertSchema,} from 'drizzle-zod'

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
export const stockReconciliation = z.object({
  reconciliationId: z.string(),
  itemId: z.string(),
  locationId: z.string(),
  expectedQuantity: z.number(),
  actualQuantity: z.number(),
  discrepancy: z.number(),
  notes: z.string().nullable(),
  reconciliationDate: z.date(),
  performedBy: z.string(),
  createdAt: z.date(),
});
export const stockMovement = z.object({
  movementId: z.string(),
  itemId: z.string(),
  locationId: z.string(),
  movementType: z.enum(["IN", "OUT"]),
  quantity: z.number(),
  referenceType: z.string().nullable(),
  referenceId: z.string().nullable(),
  notes: z.string().nullable(),
  createdBy: z.string().nullable(),
  createdAt: z.date(),
});


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



  
// export const ItemSchema = z.object({
//   itemId: z.string(),
//   itemNumber: z.number(),
//   itemName: z.string(),
//   // itemType: z.enum(['EQUIPMENT','SACK','PALLET','CARTON','OTHER','BOX' ]),
//   itemType: z.string().nullable(),
//   itemBrand: z.string().nullable(),
//   itemModel: z.string().nullable(),
//   itemBarcode: z.string().nullable(),
//   itemCountryOfOrigin: z.string().nullable(),
//   dimensions: z.object({
//     width: z.coerce.number().optional().nullable(),
//     height: z.coerce.number().optional().nullable(),
//     length: z.coerce.number().optional().nullable(),
//   }).optional().nullable(),
//   weightGrams: z.coerce.number().nullable(),
//   customerId: z.string(),
//   notes: z.string().nullable(),
//   createdBy: z.string(),
//   createdAt: z.date(),
//   updatedAt: z.date().nullable(),
//   isDeleted: z.boolean().default(false).nullable(),
//   itemStock: z.array(itemStock).nullable(),
//   // itemStock: z.object({
//   //   locationId: z.string(),
//   //   currentQuantity: z.number(),
//   //   lastUpdated: z.date().nullable(),
//   // }).array()
// })

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