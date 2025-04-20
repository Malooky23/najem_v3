// lib/zodSchemas/zohoSchemas.ts
import { z } from 'zod';

// Schema for a single line item in the input data
export const OriginalLineItemSchema = z.object({
    item_id: z.string().optional(), // Zoho Item ID (prefer this if available)
    name: z.string().optional(), // Name (use if item_id is not provided)
    description: z.string().optional().default(''), // Description is often good to have
    quantity: z.number().positive('Quantity must be positive'),
    rate: z.number().nonnegative('Rate cannot be negative').optional(),
    tax_id: z.string().optional(), // Optional tax ID for the line item
    // Add other relevant fields from the original line item you might want to copy,
    // ensuring they are valid for the CREATE API:
    // account_id: z.string().optional(),
    // unit: z.string().optional(),
    // item_order: z.number().optional(),
    // tags: z.array(z.object({ tag_id: z.string(), tag_option_id: z.string() })).optional(),
}).refine(data => data.item_id || data.name, {
    message: "Either 'item_id' or 'name' must be provided for each line item",
    path: [ "item_id | name" ], // Path hint for error
});

// Schema for the overall input data structure (representing the invoice to copy from)
export const OriginalInvoiceDataSchema = z.object({
    customer_id: z.string({ required_error: 'Customer ID is required' }).min(1, 'Customer ID cannot be empty'),
    line_items: z.array(OriginalLineItemSchema).min(1, 'Invoice must have at least one line item'),
    reference_number: z.string().optional(),
    due_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Due date must be YYYY-MM-DD").optional(),

    // --- Optional fields you likely want to copy ---
    currency_id: z.string().optional(),
    // contact_persons: z.array(z.string()).optional(), // Array of contact person IDs
    place_of_supply: z.string().optional(), // Country/region specific
    // vat_treatment: z.string().optional(),    // Country specific
    // tax_treatment: z.string().optional(),    // Country specific
    template_id: z.string().optional(), // Often useful to copy the template
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD").optional(), // Validate date format
    payment_terms: z.number().int().optional(),
    payment_terms_label: z.string().optional(),
    discount: z.number().optional(), // Can also be string like "10%" but number is safer here
    is_discount_before_tax: z.boolean().optional(),
    discount_type: z.enum([ 'entity_level', 'item_level' ]).optional(),
    is_inclusive_tax: z.boolean().optional(),
    exchange_rate: z.number().optional(),
    salesperson_name: z.string().optional(),
    notes: z.string().optional(),
    terms: z.string().optional(),
    shipping_charge: z.number().optional(),
    adjustment: z.number().optional(),
    adjustment_description: z.string().optional(),
    // billing_address: z.object({...}).optional(), // Define address schema if needed
    // shipping_address: z.object({...}).optional(), // Define address schema if needed
    // custom_fields: z.array(z.object({ customfield_id: z.string(), value: z.any() })).optional(),

});

// Type inferred from the schema for type safety in our function
export type OriginalInvoiceData = z.infer<typeof OriginalInvoiceDataSchema>;

// Schema for the expected successful response structure from Zoho Create Invoice API
// Based on the Zoho response example you provided. Refine as needed.
export const ZohoCreatedInvoiceSchema = z.object({
    invoice_id: z.string(),
    invoice_number: z.string(),
    customer_id: z.string(),
    customer_name: z.string(),
    date: z.string(),
    due_date: z.string(),
    total: z.number(),
    balance: z.number(),
    currency_code: z.string(),
    status: z.string(),
    created_time: z.string(),
    last_modified_time: z.string(),
    line_items: z.array(z.object({ // Include basic line item info in response if needed
        line_item_id: z.string(),
        item_id: z.string().optional(),
        name: z.string(),
        quantity: z.number(),
        rate: z.number(),
        item_total: z.number(),
    })),
    // Add other fields from the Zoho response you care about
});
export type ZohoCreatedInvoice = z.infer<typeof ZohoCreatedInvoiceSchema>;

export interface CreateInvoiceError extends Error {
    details?: any; // To hold Zod validation errors or Zoho API error details
}


export const tax_id = {
    zero: "5293485000000114033",
    five: "5293485000000114027"
}