/// NEW CLAUDE REWRITE
'use server'
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { db } from "@/server/db";
// import { createBusinessCustomerSchema } from "@/lib/validations/customer";
import { sql } from "drizzle-orm";
// import { revalidateCustomers } from "@/server/queries/customers";
import {z} from 'zod'


const ContactType = z.enum(['email', 'mobile', 'landline', 'other']);

const contactSchema = z.object({
  contact_type: ContactType,
  contact_data: z.string().min(3, "Contact data must be at least 3 characters"),
  is_primary: z.boolean().default(false),
});

const addressSchema = z.object({
  address1: z.string().optional().nullish(),
  address2: z.string().optional().nullish(),
  city: z.string().optional().nullish(),
  postalCode: z
    .string()
    .optional().nullish(),
  country: z.string().optional().nullish(),
});



export async function POST(req: Request) {

  const createBusinessCustomerSchema = z.object({
    businessName: z
      .string()
      .min(2, "Business name must be at least 2 characters"),
    country: z.string().min(2, "Country is required"),
    isTaxRegistered: z.boolean().default(false),
    taxNumber: z
      .string()
      .nullish()
      .refine(
        (val) => {
          // If isTaxRegistered is true, tax number should be a non-empty string
          // If isTaxRegistered is false, tax number can be null/undefined/empty
          return (
            val === null || val === undefined || val === "" || val.length >= 2
          );
        },
        { message: "Tax number must be at least 2 characters if provided" }
      ),
    addAddress: z.boolean().default(false),
    address: addressSchema.optional().nullish(),
    contacts: z.array(contactSchema).min(1, "At least one contact required"),
  }).refine(data => !data.addAddress || (data.addAddress && data.address), {
    message: "Address is required when enabled",
    path: ["address"],
  });
  try {
    // Authentication check
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Validate request body
    const body = await req.json();
    console.log('body',body)
    const validatedData = createBusinessCustomerSchema.parse(body);
    // const validatedData = body
    console.log(`      SELECT new_business_customer(
        ${validatedData.country}::TEXT,
        ${validatedData.businessName}::TEXT,
        ${validatedData.isTaxRegistered}::BOOLEAN,
        ${validatedData.taxNumber}::TEXT,
        ${JSON.stringify(validatedData.address)}::JSONB,
        ${JSON.stringify(validatedData.contacts)}::JSONB
      ) as result
    `);

    // Execute database function
    const result = await db.execute<{ result: any }>(sql`
      SELECT new_business_customer(
        ${validatedData.country}::TEXT,
        ${validatedData.businessName}::TEXT,
        ${validatedData.isTaxRegistered}::BOOLEAN,
        ${validatedData.taxNumber}::TEXT,
        ${JSON.stringify(validatedData.address)}::JSONB,
        ${JSON.stringify(validatedData.contacts)}::JSONB
      ) as result
    `);

    // Handle database response
    const dbResult = result.rows[0].result;
    if (dbResult.error_message) {
      return NextResponse.json(
        { success: false, error: dbResult.error_message },
        { status: 400 }
      );
    }

    // Use the helper function instead of direct tag revalidation
    // await revalidateCustomers();

    return NextResponse.json({ success: true, data: dbResult });
  } catch (error) {
    console.error("[BUSINESS_CUSTOMER_POST]", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}