// hooks/mutations/useCreateZohoInvoice.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createZohoInvoice } from '@/server/services/service.zoho'; // Adjust path
import {
    type OriginalInvoiceData,
    type ZohoCreatedInvoice,
    type CreateInvoiceError, // Import custom error type
} from '@/types/types.zoho'; // Adjust path
import { toast } from 'sonner';

// Define potential options for the hook, like callbacks
interface UseCreateZohoInvoiceOptions {
    onSuccess?: (data: ZohoCreatedInvoice) => void;
    onError?: (error: CreateInvoiceError) => void;
}

export function useCreateZohoInvoice(options?: UseCreateZohoInvoiceOptions) {
    const queryClient = useQueryClient();

    return useMutation<
        ZohoCreatedInvoice, // Type of data returned on success
        CreateInvoiceError, // Type of error thrown on failure
        OriginalInvoiceData // Type of variables passed to the mutation function
    >({
        mutationFn: async (invoiceData: OriginalInvoiceData) => {
            console.log('useMutation mutationFn: Calling server action...');
            const result = await createZohoInvoice(invoiceData);

            if (result.success) {
                console.log('useMutation mutationFn: Server action successful.');
                return result.data; // Return the actual invoice data on success
            } else {
                console.error('useMutation mutationFn: Server action failed.', result.error, result.details);
                // Throw an error that TanStack Query can catch
                const error = new Error(result.error) as CreateInvoiceError;
                error.details = result.details; // Attach details to the error object
                throw error;
            }
        },
        onSuccess: (data, variables) => {
            console.log('Mutation successful:', data);
            // --- Invalidate queries that should be refreshed ---
            // Example: If you have a query listing invoices, invalidate it
            // queryClient.invalidateQueries({ queryKey: ['zohoInvoices'] });
            // queryClient.invalidateQueries({ queryKey: ['zohoInvoices', { status: 'draft' }] }); // More specific

            // Call the onSuccess callback provided in options, if any
            options?.onSuccess?.(data);

            // Optional: Show a success toast notification here
            toast.success(`Invoice ${data.invoice_number} created!`);
        },
        onError: (error, variables) => {
            console.error('Mutation failed:', error);
            // The 'error' object here is the CreateInvoiceError we threw
            console.error('Error details:', error.details);

            // Call the onError callback provided in options, if any
            options?.onError?.(error);

            // Optional: Show an error toast notification here
            toast.error(`Failed to create invoice: ${error.message}`);
        },
        // onSettled: (data, error, variables) => {
        //   // Executes after onSuccess or onError
        //   console.log('Mutation settled.');
        // },
    });
}