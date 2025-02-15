import { z } from "zod";

export const createItemsSchema = z.object({
  itemName: z.string().min(1, "Required"),
  itemType: z.enum(["SACK", "PALLET", "CARTON", "OTHER", "NONE"]),
  itemBrand: z.string().optional(),
  itemModel: z.string().optional(),
  itemBarcode: z.string().optional(),
  itemCountryOfOrigin: z.string().optional(),
  weightGrams: z.number().nonnegative().optional(),
  dimensions: z
    .object({
      width: z.number().nonnegative(),
      height: z.number().nonnegative(),
      depth: z.number().nonnegative(),
    })
    .optional(),
  notes: z.string().optional(),
});



export const ItemSchema = z.object({
  itemId: z.string(),
  itemNumber: z.number(),
  itemName: z.string(),
  // itemType: z.enum(['EQUIPMENT','SACK','PALLET','CARTON','OTHER','BOX' ]),
  itemType: z.string().nullable(),
  itemBrand: z.string().nullable(),
  itemModel: z.string().nullable(),
  itemBarcode: z.string().nullable(),
  itemCountryOfOrigin: z.string().nullable(),
  dimensions: z.object({
    width: z.number(),
    height: z.number(),
    length: z.number()
  }).nullable(),
  weightGrams: z.number().nullable(),
  customerId: z.string(),
  notes: z.string().nullable(),
  createdBy: z.string(),
  createdAt: z.date(),
  updatedAt: z.string().nullable(),
  isDeleted: z.boolean().default(false) 
})

import { type Item } from "@/server/db/schema";

export type ItemZod = z.infer<typeof ItemSchema>
