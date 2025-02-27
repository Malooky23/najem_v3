"use server"

import { sql } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import { z } from 'zod'
import { db } from "@/server/db"

const ContactTypeEnum = z.enum(['email', 'phone']);
const contactSchema = z.object({
  contact_type: ContactTypeEnum,
  contact_data: z.string().min(3, "Contact data must be at least 3 characters"),
  is_primary: z.boolean().default(false),
});
const createIndividualCustomerSchema = z.object({
  firstName: z.string().min(1, "First name must be at least 1 characters"),
  middleName: z.string().optional(),
  lastName: z.string().min(1, "Last name must be at least 1 characters"),
  displayName: z.string().max(100, "Display name must be at most 100 characters"),
  personalId: z.string().optional().nullish(),
  country: z.string().min(2, "Country is required"),
  addAddress: z.boolean().default(false),
  address: z.object({
    address1: z.string().optional().nullish(),
    address2: z.string().optional().nullish(),
    city: z.string().optional().nullish(),
    postalCode: z.string().optional().nullish(),
    country: z.string().optional().nullish(),
  }).optional().nullish(),
  contacts: z.array(contactSchema).min(1, "At least one contact required"),
  notes: z.string().nullable().default(null)
  }).refine(data => !data.addAddress || (data.addAddress && data.address), {
    message: "Address is required when enabled",
    path: ["address"],
});


const createBusinessCustomerSchema = z.object({
    businessName: z
      .string()
      .min(2, "Business name must be at least 2 characters"),
    displayName: z.string().max(100, "Display name must be at most 100 characters"),
    country: z.string().min(2, "Country is required"),
    isTaxRegistered: z.boolean().default(false),
    taxNumber: z
      .string()
      .nullish()
      .refine(
        (val) => {
          return (
            val === null || val === undefined || val === "" || val.length >= 2
          );
        },
        { message: "Tax number must be at least 2 characters if provided" }
      ),
    addAddress: z.boolean().default(false),
    address: z.object({
      address1: z.string().optional().nullish(),
      address2: z.string().optional().nullish(),
      city: z.string().optional().nullish(),
      postalCode: z.string().optional().nullish(),
      country: z.string().optional().nullish(),
    }).optional().nullish(),
    contacts: z.array(contactSchema).min(1, "At least one contact required"),
    notes: z.string().nullable().default(null)
  }).refine(data => !data.addAddress || (data.addAddress && data.address), {
    message: "Address is required when enabled",
    path: ["address"],
});

export async function createBusinessCustomer(data: Record<string, any>) {
  try {
    const validatedData = createBusinessCustomerSchema.parse(data);
    console.log(`      
      SELECT new_business_customer(
                  ${validatedData.displayName}::TEXT,
            ${validatedData.country}::TEXT,
            ${validatedData.businessName}::TEXT,
            ${validatedData.isTaxRegistered}::BOOLEAN,
            ${validatedData.taxNumber}::TEXT,
            ${JSON.stringify(validatedData.address)}::JSONB,
            ${JSON.stringify(validatedData.contacts)}::JSONB,
            ${validatedData.notes}::TEXT
          ) as result`
    );

    await new Promise((resolve) => setTimeout(resolve, 3000));
    const result = await db.execute<{ result: any }>(sql`
          SELECT new_business_customer(
            ${validatedData.displayName}::TEXT,
            ${validatedData.country}::TEXT,
            ${validatedData.businessName}::TEXT,
            ${validatedData.isTaxRegistered}::BOOLEAN,
            ${validatedData.taxNumber}::TEXT,
            ${JSON.stringify(validatedData.address)}::JSONB,
            ${JSON.stringify(validatedData.contacts)}::JSONB,
            ${validatedData.notes}::TEXT
          ) as result
        `);
    const dbResult = result.rows[0].result;
    console.log(dbResult);
    console.log('==========END============')
    console.log(',')
    console.log(',')


    // Add revalidation here after successful DB operation
    revalidatePath('/customers');

    return dbResult

  } catch (error) {
    console.error('Validation error:', error);
    console.error('Submitted Data:', data);
    console.log('==========END============')
    console.log(',')
    console.log(',')
    return { success: false, error };
  }
}

export async function createIndividualCustomer(data: Record<string, any>) {
  try {
    const validatedData = createIndividualCustomerSchema.parse(data);
    console.log('Validated data:', validatedData);

    // Add your database operation here

    // Add revalidation here after successful DB operation
    revalidatePath('/customers');

    return { success: true, data: validatedData };

  } catch (error) {
    console.error('Validation error:', error);
    console.error('Submitted Data:', data);
    return { success: false, error };
  }
}