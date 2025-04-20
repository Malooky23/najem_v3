'use client'; // Required for hooks like useState and useMutation

import React, { useState } from 'react';
import { useCreateZohoInvoice } from '@/hooks/data/useZoho'; // Adjust path if needed
import { tax_id, type OriginalInvoiceData } from '@/types/types.zoho'; // Adjust path if needed

// --- Shadcn UI Imports ---
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Alert,
    AlertDescription,
    AlertTitle,
} from "@/components/ui/alert";
import { Loader2, AlertTriangle, CheckCircle } from "lucide-react"; // Icons
// --- --- --- --- --- ---

export default function InvoiceCreatorPage() {
    const {
        mutate,
        mutateAsync, // Keep if you might use it, but the example focuses on mutate
        data: createdInvoice,
        error: mutationError,
        isPending,
        isSuccess,
        isError,
        reset,
    } = useCreateZohoInvoice({
        onSuccess: (data) => {
            console.log(`Callback: Invoice ${data.invoice_number} created successfully.`);
            // Clear form or redirect if needed
        },
        onError: (error) => {
            console.error(`Callback: Error creating invoice: ${error.message}`);
        },
    });

    // Local state for errors specifically from mutateAsync if you were to use it
    // const [ localError, setLocalError ] = useState<string | null>(null);

    const handleCreateInvoice = () => {
        // setLocalError(null); // Clear local async errors if using that pattern
        reset(); // Reset mutation state (clears previous success/error)

        const dueDate = new Date();
        // Ensure month is 0-padded if needed by Zoho API, though day/month/year might be locale-dependent
        // Zoho often prefers YYYY-MM-DD
        // Let's try ISO format which is less ambiguous:
        const formattedDueDate = `${dueDate.getFullYear()}-${String(dueDate.getMonth() + 2).padStart(2, '0')}-15`; // Add 15 days - adjust logic as needed!
        console.log("date: ", formattedDueDate)
        const invoiceData: OriginalInvoiceData = {
            customer_id: "5293485000000162309",
            template_id: "5293485000000131212",
            line_items: [
                {
                    item_id: "5293485000000214083",
                    quantity: 1,
                    rate: 4500.0,
                    description: "Airfreight test",
                    tax_id: tax_id.zero,
                },
                {
                    item_id: "5293485000000125001",
                    quantity: 1,
                    description: "MOFA - TEST",
                    // tax_id: tax_id.,
                },
                {
                    item_id: "5293485000000156106",
                    description: "MARK: TEST",
                    quantity: 2,
                    tax_id: tax_id.five
                },
            ],
            // Use ISO format YYYY-MM-DD for dates with Zoho API usually
            due_date: formattedDueDate,
            // Add other necessary fields like reference_number, notes, terms etc.
            // reference_number: `Test-${Date.now()}`,
        };

        // Trigger the mutation using the standard mutate function
        mutate(invoiceData);

        // --- Example of using mutateAsync (if needed) ---
        /*
        const handleCreateInvoiceAsync = async () => {
            setLocalError(null);
            reset();
            try {
                const newInvoice = await mutateAsync(invoiceData);
                console.log("Created via mutateAsync:", newInvoice);
                // Handle success explicitly here if needed
            } catch (err) {
                console.error("Error from mutateAsync:", err);
                setLocalError((err as Error).message);
            }
        }
        // If using mutateAsync, you might call handleCreateInvoiceAsync() instead of mutate()
        */
        // --- --- --- --- --- --- --- --- --- --- --- ---
    };

    return (
        <div className="container mx-auto p-4 md:p-8">
            <Card className="w-full max-w-2xl mx-auto">
                <CardHeader>
                    <CardTitle>Create Zoho Invoice (Test)</CardTitle>
                    <CardDescription>
                        Use this page to create a test invoice in Zoho Books via the API.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* Button is now the primary action element */}
                    <Button
                        onClick={handleCreateInvoice}
                        disabled={isPending}
                        className="w-full sm:w-auto"
                    >
                        {isPending ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Creating Invoice...
                            </>
                        ) : (
                            'Create Test Invoice'
                        )}
                    </Button>

                    {/* Success Message */}
                    {isSuccess && createdInvoice && (
                        <Alert variant="default" className="mt-4 bg-green-50 border-green-200 text-green-800">
                             <CheckCircle className="h-4 w-4 !text-green-600" /> {/* Ensure icon color contrast */}
                            <AlertTitle>Invoice Created Successfully!</AlertTitle>
                            <AlertDescription>
                                <p>Invoice Number: <strong>{createdInvoice.invoice_number}</strong></p>
                                <p>Invoice ID: <code>{createdInvoice.invoice_id}</code></p>
                                <a href={"https://books.zoho.com/app/857920241#/invoices/"+createdInvoice.invoice_id} target="_blank" rel="noopener noreferrer" className="mt">View Invoice on Zoho</a>
                                <details className="mt-2 text-xs">
                                    <summary className="cursor-pointer hover:underline">View Full Response</summary>
                                    <pre className="mt-1 p-2 bg-gray-100 rounded overflow-x-auto">
                                        {JSON.stringify(createdInvoice, null, 2)}
                                    </pre>
                                </details>
                            </AlertDescription>
                        </Alert>
                    )}

                    {/* Error Message */}
                    {isError && mutationError && (
                        <Alert variant="destructive" className="mt-4">
                            <AlertTriangle className="h-4 w-4" />
                            <AlertTitle>Error Creating Invoice</AlertTitle>
                            <AlertDescription>
                                <p>{mutationError.message}</p>
                                {/* Display details if they exist */}
                                {(mutationError as any).details && (
                                    <div className="mt-2">
                                        <strong>Details:</strong>
                                        <pre className="mt-1 p-2 bg-destructive/10 rounded text-xs overflow-x-auto">
                                            {JSON.stringify((mutationError as any).details, null, 2)}
                                        </pre>
                                    </div>
                                )}
                            </AlertDescription>
                        </Alert>
                    )}

                    {/* Display local errors if using mutateAsync pattern */}
                    {/* {localError && (
                        <Alert variant="destructive" className="mt-4">
                            <AlertTriangle className="h-4 w-4" />
                            <AlertTitle>Operation Error</AlertTitle>
                            <AlertDescription>{localError}</AlertDescription>
                        </Alert>
                    )} */}

                </CardContent>
                <CardFooter>
                    <p className="text-xs text-muted-foreground">
                        Ensure customer, template, and item IDs are correct for your Zoho organization.
                    </p>
                </CardFooter>
            </Card>
        </div>
    );
}
