'use server'; // Mark this module as containing Server Actions

import {
    OriginalInvoiceDataSchema,
    type OriginalInvoiceData,
    type ZohoCreatedInvoice,
    ZohoCreatedInvoiceSchema,
} from '@/types/types.zoho'; // Adjust path if needed

// Define return types for the action
type ActionResponse<T> =
    | { success: true; data: T }
    | { success: false; error: string; details?: any };

// --- Helper Function to Get Access Token ---
interface ZohoTokenResponse {
    access_token?: string;
    api_domain?: string;
    expires_in?: number;
    error?: string; // Capture potential errors from token endpoint
}

async function getZohoAccessToken(): Promise<{
    accessToken: string;
    apiDomain: string;
}> {
    const clientId = process.env.ZOHO_CLIENT_ID;
    const clientSecret = process.env.ZOHO_CLIENT_SECRET;
    const refreshToken = process.env.ZOHO_REFRESH_TOKEN;
    const accountsDomain = 'https://accounts.zoho.com'; // Default

    if (!clientId || !clientSecret || !refreshToken) {
        console.error('Zoho API Error: Missing environment variables for authentication.');
        throw new Error('Server configuration error: Zoho credentials missing.');
    }

    const tokenUrl = `${accountsDomain}/oauth/v2/token`;
    const params = new URLSearchParams();
    params.append('refresh_token', refreshToken);
    params.append('client_id', clientId);
    params.append('client_secret', clientSecret);
    params.append('grant_type', 'refresh_token');

    try {
        console.log('Requesting new Zoho access token...');
        const response = await fetch(tokenUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: params.toString(),
            cache: 'no-store', // Ensure fresh token request
        });

        const data: ZohoTokenResponse = await response.json();

        if (!response.ok || data.error || !data.access_token || !data.api_domain) {
            console.error('Zoho Token Error:', data);
            throw new Error(
                `Failed to refresh Zoho token: ${data.error || response.statusText || 'Unknown error'}`
            );
        }

        console.log(`Successfully obtained new access token. Using API Domain: ${data.api_domain}`);
        return {
            accessToken: data.access_token,
            apiDomain: data.api_domain,
        };
    } catch (error) {
        console.error('Error during Zoho token request:', error);
        // Re-throw a more generic error for the client, but log specific details on server
        if (error instanceof Error) {
            throw new Error(`Failed to authenticate with Zoho: ${error.message}`);
        }
        throw new Error('An unknown error occurred during Zoho authentication.');
    }
}

// --- Server Action to Create Invoice Copy ---
export async function createZohoInvoice(
    // Input can be unknown initially, Zod will validate
    invoiceData: OriginalInvoiceData
): Promise<ActionResponse<ZohoCreatedInvoice>> {
    console.log('Server Action: createZohoInvoice invoked.');

    // 1. Validate Input Data using Zod
    const validationResult = OriginalInvoiceDataSchema.safeParse(invoiceData);

    if (!validationResult.success) {
        console.error('Input validation failed:', validationResult.error.flatten());
        return {
            success: false,
            error: 'Invalid input data provided.',
            details: validationResult.error.flatten().fieldErrors, // Provide field errors
        };
    }

    // Now we have type-safe validated data
    const validatedData: OriginalInvoiceData = validationResult.data;

    const organizationId = process.env.ZOHO_ORGANIZATION_ID;
    if (!organizationId) {
        console.error('Zoho Config Error: ZOHO_ORGANIZATION_ID not set.');
        return { success: false, error: 'Server configuration error: Organization ID missing.' };
    }

    try {
        // 2. Get Access Token and API Domain
        const { accessToken, apiDomain } = await getZohoAccessToken();

        // 3. Prepare the payload for the new invoice
        const newInvoicePayload: Record<string, any> = {}; // Use a generic object first

        // Copy required and optional fields defined in the schema
        newInvoicePayload.customer_id = validatedData.customer_id;

        // Add other optional fields IF they exist in the validated input
        const optionalFields: (keyof OriginalInvoiceData)[] = [
            'due_date', 
            'template_id', 
            'reference_number', 
            //other options
            'currency_id', 
            'place_of_supply', 
            'date',
            'payment_terms', 
            'payment_terms_label', 
            'discount',
            'is_discount_before_tax', 
            'discount_type', 
            'is_inclusive_tax', 
            'exchange_rate',
            'salesperson_name', 
            'notes', 
            'terms', 
            'shipping_charge', 
            'adjustment',
            'adjustment_description', 
        ];

        optionalFields.forEach(field => {
            if (validatedData[ field ] !== undefined && validatedData[ field ] !== null) {
                newInvoicePayload[ field ] = validatedData[ field ];
            }
        });

        newInvoicePayload.line_items = validatedData.line_items.map(item => {
            const newLineItem: Record<string, any> = {
                item_id: item.item_id,
                quantity: item.quantity,
                rate: item.rate,
                description: item.description || '', // Ensure description is always a string
            };
            if (item.tax_id) newLineItem.tax_id = item.tax_id;
            
            return newLineItem;
        });

        // 4. Make the API Call to Create Invoice
        const createInvoiceUrl = `${apiDomain}/books/v3/invoices`;
        const headers = {
            'Authorization': `Zoho-oauthtoken ${accessToken}`,
            'Content-Type': 'application/json',
        };
        const params = new URLSearchParams({ organization_id: organizationId });
        // Add query params like 'send=true' if needed: params.append('send', 'true');

        // console.log(`POST request to ${createInvoiceUrl}?${params.toString()}`);
        // console.log("Payload:", JSON.stringify(newInvoicePayload, null, 2)); // Debug: Log payload

        const response = await fetch(`${createInvoiceUrl}?${params.toString()}`, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(newInvoicePayload),
        });

        const responseData = await response.json();

        // 5. Handle Zoho's Response
        if (!response.ok || responseData.code !== 0) {
            console.error(`Zoho API Error (${response.status}):`, responseData);
            return {
                success: false,
                error: `Failed to create Zoho invoice: ${responseData.message || response.statusText || 'Unknown API error'}`,
                details: responseData, // Include full Zoho error details if available
            };
        }

        // 6. Validate the successful Zoho response (optional but recommended)
        const createdInvoiceValidation = ZohoCreatedInvoiceSchema.safeParse(responseData.invoice);
        if (!createdInvoiceValidation.success) {
            console.warn("Zoho success response structure mismatch:", createdInvoiceValidation.error.flatten());
            // Still return success, but maybe log this mismatch. Provide the raw data.
            return { success: true, data: responseData.invoice as ZohoCreatedInvoice }; // Cast carefully
        }

        console.log(`Successfully created new invoice: ID ${createdInvoiceValidation.data.invoice_id}, Number ${createdInvoiceValidation.data.invoice_number}`);
        return { success: true, data: createdInvoiceValidation.data };

    } catch (error) {
        console.error('Unexpected error in createZohoInvoiceCopy:', error);
        // Handle errors from getZohoAccessToken or other unexpected issues
        return {
            success: false,
            error: error instanceof Error ? error.message : 'An unexpected server error occurred.',
        };
    }
}