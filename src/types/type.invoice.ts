import { z } from "zod";
import { tax_id } from "./types.zoho";

// --- Define Schema for a single Line Item ---
export const lineItemSchema = z.object({
    // Include fields needed for display/identification but maybe not editable
    orderExpenseId: z.string().optional(), // Keep original ID if exists
    orderId: z.string().optional().nullish().nullable(),
    orderNumber: z.number().nullable().optional(),
    expenseItemId: z.string().optional().nullable().nullish(), // Keep original ID
    expenseItemName: z.string().nullable().optional(), // For display

    // Editable fields
    description: z.string().optional(), // Will be dynamically generated/editable
    quantity: z.coerce.number().min(0, "Quantity cannot be negative"), // Allow 0 for deletion marking? Or handle deletion separately. Let's use remove. Min 1?
    rate: z.number().min(0, "Rate cannot be negative"),
    tax: z.string() // Store the Zoho Tax ID string directly
        .optional()
        .default(tax_id.five), // Default to the zero tax ID string    notes: z.string().optional().nullable(),

    // Potentially calculated, not directly part of form state unless needed
    // total: z.number().optional(),
});
export type LineItemFormData = z.infer<typeof lineItemSchema>;

// --- Define Schema for the entire Invoice Form ---
export const invoiceFormSchema = z.object({
    // Add other top-level invoice fields if needed (e.g., invoice date, due date)
    // invoiceDate: z.date().optional(),
    lineItems: z.array(lineItemSchema),
});
export type InvoiceFormData = z.infer<typeof invoiceFormSchema>;



