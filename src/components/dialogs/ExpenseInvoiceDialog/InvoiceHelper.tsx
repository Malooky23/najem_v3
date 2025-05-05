// src/components/dialogs/ExpenseInvoiceDialog/invoiceHelpers.ts
import { format } from 'date-fns';
import { EnrichedOrderExpenseSchemaType, selectExpenseSchemaType } from "@/types/expense";
import { OrderSchemaType } from "@/types/orders";
import { LineItemFormData, InvoiceFormData } from "@/types/type.invoice"; // Import types needed for mapping/merging
import { CreateZohoInvoiceDataSchema, tax_id, ZOHO_ITEM_ID } from "@/types/types.zoho"; // Import Zoho types
import { z } from "zod"; // Need z for Zoho schema typing


// Helper to format currency
export const formatCurrency = (amount: number | null | undefined): string => {
    if (amount === null || amount === undefined) return "AED 0.00";
    return `AED ${amount.toFixed(2)}`;
};

/**
 * Helper to format date into 'yyyy-MM-dd'.
 * @param date - The date string or Date object.
 * @returns Formatted date string or null if invalid/null.
 */
export const formatDate = (date: Date | string | null | undefined): string | null => {
    if (!date) return null;
    try {
        return format(new Date(date), 'yyyy-MM-dd');
    } catch { return 'Invalid Date'; }
};

/**
 * Generates the initial description for an invoice line item based on expense details.
 * Special handling for Sack items to include order date and mark.
 * @param item - The enriched order expense item.
 * @param orderDetailsMap - A map of orderId to order details (createdAt, orderMark).
 * @returns The generated description or undefined.
 */
export const generateInitialDescription = (
    item: EnrichedOrderExpenseSchemaType,
    orderDetailsMap: Map<string, { createdAt: Date | string | null; orderMark: string | null }> | undefined
): string | undefined => {
    const isSackItem = item.expenseItemName === "Sack Repacking" 
    if (isSackItem) {
        const orderDetails = item.orderId ? orderDetailsMap?.get(item.orderId) : undefined;
        if (orderDetails) {
            const formattedDate = formatDate(orderDetails.createdAt);
            const mark = orderDetails.orderMark ?? 'N/A';
            const quantity = item.expenseItemQuantity ?? 0;
            return `Date: ${formattedDate ?? 'N/A'} | Mark: ${mark} | Total Sacks: ${quantity}`;
        }
        return 'Loading order details...'; // Or maybe undefined if map is not ready?
    }
    return item.notes ?? undefined;
};


/**
 * Merges line items from the form data, specifically grouping identical sack items from the same order.
 * @param lineItems - Array of line items from the form data.
 * @returns Array of merged line items.
 */
export const mergeInvoiceLineItems = (lineItems: LineItemFormData[]): LineItemFormData[] => {
    const groupedItems = new Map<string, LineItemFormData>();

    lineItems.forEach((item, index) => {
        const isSack = item.expenseItemName === "Sack Small" || item.expenseItemName === "Sack Large";
        let groupingKey: string;

        // Define grouping key: For sacks from the same order with the same rate, use a combined key. Otherwise, use a unique key.
        // Using item.rate in the key ensures sacks with different prices from the same order are not merged.
        if (isSack && item.orderId && item.rate !== undefined && item.rate !== null) {
            groupingKey = `sack-${item.orderId}-${item.rate.toFixed(2)}-${item.tax}`; // Include tax in key
        } else {
            // Use a unique key for non-sack items or sacks without orderId/rate/tax
            // Using orderExpenseId for original items, or index for manual items as a fallback unique identifier during this process
            groupingKey = item.orderExpenseId ? `orig-${item.orderExpenseId}` : `new-${index}`;
        }

        const existingGroup = groupedItems.get(groupingKey);

        if (existingGroup && isSack && item.orderId && item.rate !== undefined && item.rate !== null) {
            // If it's a sack and a group already exists with the same order, rate, and tax, sum the quantity
            existingGroup.quantity = (existingGroup.quantity ?? 0) + (item.quantity ?? 0);
            // Description: Keep the description of the first item added to the group.
            // existingGroup.description = existingGroup.description || item.description; // Optional: keep first non-empty desc
        } else if (!existingGroup) {
            // If no group exists, add this item (create a copy)
            groupedItems.set(groupingKey, { ...item });
        }
        // If a group exists but it's not a sack being merged, we simply ignore the current item
        // as the first one encountered (non-sack or unique sack) is already in the map.
    });

    return Array.from(groupedItems.values());
};

/**
 * Maps merged line items data from the form format to the Zoho Invoice API format.
 * Requires expense item data to find Zoho item IDs.
 * @param mergedLineItems - Array of line items after merging.
 * @param expenseItemsData - Array of expense item details (from API).
 * @returns Array of line items in the Zoho API format.
 */
export const mapToZohoLineItems = (
    mergedLineItems: LineItemFormData[],
    expenseItemsData: selectExpenseSchemaType[] | undefined
): z.infer<typeof CreateZohoInvoiceDataSchema.shape.line_items.element>[] => {

    if (!expenseItemsData) {
        console.error("Expense item data is missing, cannot map to Zoho line items.");
        return []; // Return empty array if data is missing
    }

    return mergedLineItems.map((formItem, index) => {
        let zohoItemId: string | undefined | null = undefined;
        let zohoItemName: string | undefined = undefined;

        if (formItem.expenseItemId) {
            const selectedExpenseItem = expenseItemsData.find(ei => ei.expenseItemId === formItem.expenseItemId);
            if (selectedExpenseItem) {
                zohoItemId = selectedExpenseItem.zohoItemId;
                if (!zohoItemId) {
                    // Fallback to name if Zoho ID is missing for the selected item
                    console.warn(`Zoho Item ID missing for selected expense item: ${selectedExpenseItem.expenseName} (ID: ${formItem.expenseItemId}). Using name instead.`);
                    zohoItemName = selectedExpenseItem.expenseName;
                }
            } else {
                // Fallback to name if expenseItemId doesn't match fetched data
                console.warn(`Selected expense item ID ${formItem.expenseItemId} not found in loaded expense items data.`);
                zohoItemName = formItem.expenseItemName || `Unknown Item ${index + 1}`;
            }
        } else {
            // Fallback to name if no expenseItemId is present (e.g., manual entry)
            console.warn(`Item at index ${index} has no expenseItemId selected.`);
            zohoItemName = formItem.expenseItemName || `Manual Item ${index + 1}`;
        }

        const zohoItem: any = {
            description: formItem.description || '',
            quantity: formItem.quantity,
            rate: formItem.rate,
            tax_id: formItem.tax, // Use the tax_id directly from form data
        };

        // Prioritize item_id, fallback to name if ID is missing
        if (zohoItemId) {
            zohoItem.item_id = zohoItemId;
        } else if (zohoItemName) {
            zohoItem.name = zohoItemName;
        } else {
            // Should not happen if fallbacks are in place, but good safety
            console.error(`Could not determine item_id or name for item at index ${index}`);
            zohoItem.name = `Error Item ${index + 1}`; // Ensure a name is always present
        }

        // If tax_id is explicitly undefined/null, remove it
        if (zohoItem.tax_id === undefined || zohoItem.tax_id === null) {
            delete zohoItem.tax_id;
        }

        return zohoItem as z.infer<typeof CreateZohoInvoiceDataSchema.shape.line_items.element>;
    });
};
