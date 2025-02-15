"use server";
import { db } from "@/server/db";
import { z } from "zod";
import { brands, itemsList, itemType } from "./consts";
import { COUNTRIES } from "@/lib/constants/countries";
import { items } from "@/server/db/schema";
import { auth } from "@/lib/auth/auth";

export async function GenerateItems(concurrent: boolean) {
  const customerIds = await db.query.customers.findMany({
    columns: { customerId: true },
  });

  const session = await auth();
  const user_id = session?.user.id || '0'

  console.log("Starting GenerateItems");

  if (true) {
    const insertPromises = Array.from({ length: 1 }, (_, i) => {
      const ranType = itemType[Math.floor(Math.random() * itemType.length)];
      console.log("Inserting item", i);
      const randomItem = {
        itemName: itemsList[Math.floor(Math.random() * itemsList.length)],
        itemType: ranType,
        itemBrand: brands[Math.floor(Math.random() * brands.length)],
        itemModel: brands[Math.floor(Math.random() * brands.length)],
        itemBarcode: Math.floor(Math.random() * 1000000000).toString(),
        itemCountryOfOrigin: COUNTRIES[Math.floor(Math.random() * COUNTRIES.length)].label,
        packingType: ranType,
        weightGrams: Math.floor((Math.random() + 10) * 10000),
        dimensions: {
          width: Math.floor(Math.random() * 1000) + 40,
          height: Math.floor(Math.random() * 1000) + 40,
          length: Math.floor(Math.random() * 1000) + 40,
        },
        notes: "this is a purely random note for sure",
        customerId: customerIds[Math.floor(Math.random() * customerIds.length)]
          .customerId.toString(),
        createdBy: user_id,
      };

      return db
        .insert(items)
        .values(randomItem)
        .returning()
        .then((push) => {
          if (push[0]) {
            console.log("Success:", push[0].itemId);
          }
        })
        .catch((err) => {
          console.log("Error inserting item:", err);
        });
    });

    await Promise.all(insertPromises);
  } else {
    for (let i = 0; i < 10; i++) {
      const ranType = itemType[Math.floor(Math.random() * itemType.length)];
      console.log("Inserting item", i);
      const randomItem = {
        itemName: itemsList[Math.floor(Math.random() * itemsList.length)],
        itemType: ranType,
        itemBrand: brands[Math.floor(Math.random() * brands.length)],
        itemModel: brands[Math.floor(Math.random() * brands.length)],
        itemBarcode: Math.floor(Math.random() * 1000000000).toString(),
        itemCountryOfOrigin: COUNTRIES[Math.floor(Math.random() * COUNTRIES.length)]
          .label,
        packingType: ranType,
        weightGrams: Math.floor((Math.random() + 10) * 10000),
        dimensions: {
          width: Math.floor(Math.random() * 1000) + 40,
          height: Math.floor(Math.random() * 1000) + 40,
          length: Math.floor(Math.random() * 1000) + 40,
        },
        notes: "this is a purely random note for sure",
        customerId: customerIds[Math.floor(Math.random() * customerIds.length)]
          .customerId.toString(),
        createdBy: "3b8ef4fa-0003-43aa-b8ce-2e2e27653aea",
      };

      try {
        const push = await db.insert(items).values(randomItem).returning();
        if (push[0]) {
          console.log("Success:", push[0].itemId);
        }
      } catch (error) {
        console.log("Error inserting item:", error);
      }
    }
  }
}
