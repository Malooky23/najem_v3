//src/components/dialogs/ExpenseInvoiceDialog/InvoiceCustomerInfoCard.tsx
'use client'

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton";
import { useSearchOrderExpenses } from "@/hooks/data/useExpenses";
// Using MessageCircleWarning as PackageWarning wasn't imported in the provided context
import { UserCircle2, Hash, AlertTriangle, MessageCircleWarning } from "lucide-react"

interface InvoiceCustomerInfoCardProps {
    customerName: string | undefined | null;
    customerId: string | undefined | null;
    orderNumbers: string[]; // Included order numbers for the invoice
}

export function InvoiceCustomerInfoCard({ customerName, customerId, orderNumbers }: InvoiceCustomerInfoCardProps) {

    const displayName = customerName || (customerId ? `ID: ${customerId}` : 'N/A');

    // Fetch pending expenses for this customer
    const { data: pendingExpensesData, isLoading: isLoadingPending, isError: isErrorPending } = useSearchOrderExpenses(
        {
            customerId: customerId ?? undefined,
            status: "PENDING"
        },
        { enabled: !!customerId }
    );

    // Calculate total pending expenses AND count per order number
    const { totalPendingCount, pendingOrdersWithCounts } = useMemo(() => {
        if (!pendingExpensesData) {
            return { totalPendingCount: 0, pendingOrdersWithCounts: [] };
        }

        // Use a Map to store counts per order number
        const countsMap = new Map<number, number>();

        pendingExpensesData.forEach(exp => {
            // Ensure orderNumber exists and is valid before adding
            if (exp.orderNumber !== undefined && exp.orderNumber !== null) {
                const currentCount = countsMap.get(exp.orderNumber) ?? 0;
                countsMap.set(exp.orderNumber, currentCount + 1);
            }
        });

        // Convert Map to an array of objects and sort
        const sortedCounts = Array.from(countsMap.entries())
            .map(([ orderNumber, count ]) => ({ orderNumber, count }))
            .sort((a, b) => a.orderNumber - b.orderNumber); // Sort numerically

        return {
            totalPendingCount: pendingExpensesData.length,
            pendingOrdersWithCounts: sortedCounts
        };
    }, [ pendingExpensesData ]);

    return (
        <Card className="bg-white/70 shadow-sm border flex-shrink-0">
            <CardHeader className="p-4 pb-2">
                <CardTitle className="text-lg text-gray-700">Invoice Details</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-2">
                <div className="space-y-3">
                    {/* Customer Info */}
                    <div className="grid grid-cols-3 gap-2 items-center">
                        <div className="text-sm text-gray-500 col-span-1">Customer</div>
                        <div className="flex items-center gap-2 text-sm font-medium text-gray-700 col-span-2">
                            <UserCircle2 className="w-4 h-4 text-indigo-500 flex-shrink-0" />
                            <span className="truncate" title={displayName}>{displayName}</span>
                        </div>
                    </div>

                    {/* Included Order Numbers */}
                    <div className="grid grid-cols-3 gap-2">
                        <div className="text-sm text-gray-500 col-span-1 self-start pt-1">Included Orders</div>
                        <div className="flex items-start gap-2 text-sm font-medium text-gray-700 col-span-2">
                            <Hash className="w-4 h-4 text-blue-500 flex-shrink-0 mt-1" />
                            {orderNumbers.length > 0 ? (
                                <div className="flex flex-col space-y-1 max-h-20 overflow-y-auto custom-scrollbar pr-1">
                                    {orderNumbers.map((num) => (
                                        <span key={num} className="block text-xs bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded font-mono">
                                            #{num}
                                        </span>
                                    ))}
                                </div>
                            ) : (
                                <span className="text-xs text-muted-foreground italic">None</span>
                            )}
                        </div>
                    </div>

                    {/* Pending Expenses Info */}
                    <div className="grid grid-cols-3 gap-2">
                        <div className="text-sm text-gray-500 col-span-1 self-start pt-1">Pending Expenses</div>
                        <div className="col-span-2">
                            {isLoadingPending ? (
                                <div className="space-y-1.5">
                                    <Skeleton className="h-4 w-20" />
                                    <Skeleton className="h-4 w-24" />
                                    <Skeleton className="h-4 w-16" />
                                </div>
                            ) : isErrorPending ? (
                                <div className="flex items-center gap-1 text-xs text-red-600">
                                    <AlertTriangle className="w-3 h-3 flex-shrink-0" />
                                    <span>Error loading</span>
                                </div>
                            ) : totalPendingCount > 0 ? (
                                <div className="flex items-start gap-2 text-sm font-medium text-gray-700">
                                    <MessageCircleWarning className="w-4 h-4 text-orange-500 flex-shrink-0 mt-1" />
                                    {/* Container for summary and list */}
                                    <div className="flex flex-col space-y-1 w-full">
                                        {/* Summary Line */}
                                        <span className="text-sm font-semibold">
                                            {totalPendingCount} item(s) across {pendingOrdersWithCounts.length} order(s)
                                        </span>
                                        {/* List/Table Container */}
                                        <div className="flex flex-col space-y-1 max-h-20 overflow-y-auto custom-scrollbar pr-1 border-t border-orange-100 pt-1">
                                            {/* Optional Header for Table View */}
                                            {/* <div className="grid grid-cols-2 gap-1 text-xs font-medium text-orange-700/80 sticky top-0 bg-orange-50/50 px-1.5 py-0.5">
                                                <span>Order #</span>
                                                <span className="text-right">Items</span>
                                            </div> */}
                                            {pendingOrdersWithCounts.map(({ orderNumber, count }) => (
                                                // Row using grid for alignment
                                                <div key={orderNumber} className="grid grid-cols-2 gap-1 text-xs bg-orange-50 text-orange-700 px-1.5 py-0.5 rounded font-mono">
                                                    <span>Order #{orderNumber}</span>
                                                    <span className="text-right">{count} Pending</span> {/* Align count to the right */}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <span className="text-xs text-muted-foreground italic">None pending</span>
                            )}
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
