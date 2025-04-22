// // src/components/dialogs/ExpenseInvoiceDialog/InvoiceCustomerInfoCard.tsx
// 'use client'

// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
// import { UserCircle2, Hash } from "lucide-react" // Using Hash for Order IDs

// interface InvoiceCustomerInfoCardProps {
//     customerName: string | undefined | null;
//     customerId: string | undefined | null; // Added customerId as fallback
//     orderIds: string[];
// }

// export function InvoiceCustomerInfoCard({ customerName, customerId, orderIds }: InvoiceCustomerInfoCardProps) {

//     const displayName = customerName || (customerId ? `ID: ${customerId}` : 'N/A');

//     return (
//         <Card className="bg-white/70 shadow-sm border flex-shrink-0">
//             <CardHeader className="p-4 pb-2">
//                 <CardTitle className="text-lg text-gray-700">Invoice Details</CardTitle>
//             </CardHeader>
//             <CardContent className="p-4 pt-2">
//                 <div className="space-y-3">
//                     {/* Customer Info */}
//                     <div className="grid grid-cols-3 gap-2 items-center">
//                         <div className="text-sm text-gray-500 col-span-1">Customer</div>
//                         <div className="flex items-center gap-2 text-sm font-medium text-gray-700 col-span-2">
//                             <UserCircle2 className="w-4 h-4 text-indigo-500 flex-shrink-0" />
//                             <span className="truncate" title={displayName}>{displayName}</span>
//                         </div>
//                     </div>

//                     {/* Order IDs */}
//                     <div className="grid grid-cols-3 gap-2">
//                         <div className="text-sm text-gray-500 col-span-1 self-start pt-1">Included Orders</div>
//                         <div className="flex items-start gap-2 text-sm font-medium text-gray-700 col-span-2">
//                             <Hash className="w-4 h-4 text-blue-500 flex-shrink-0 mt-1" />
//                             {orderIds.length > 0 ? (
//                                 <div className="flex flex-col space-y-1 max-h-40 overflow-y-auto custom-scrollbar pr-1">
//                                     {orderIds.map((id) => (
//                                         <span key={id} className="block text-xs bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded font-mono">
//                                             #{id}
//                                         </span>
//                                     ))}
//                                 </div>
//                             ) : (
//                                 <span className="text-xs text-muted-foreground italic">None</span>
//                             )}
//                         </div>
//                     </div>
//                 </div>
//             </CardContent>
//         </Card>
//     )
// }


// src/components/dialogs/ExpenseInvoiceDialog/InvoiceCustomerInfoCard.tsx
'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { UserCircle2, Hash } from "lucide-react"

interface InvoiceCustomerInfoCardProps {
    customerName: string | undefined | null;
    customerId: string | undefined | null;
    orderNumbers: string[]; // Changed prop name
}

export function InvoiceCustomerInfoCard({ customerName, customerId, orderNumbers }: InvoiceCustomerInfoCardProps) { // Updated prop name

    const displayName = customerName || (customerId ? `ID: ${customerId}` : 'N/A');

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

                    {/* Order Numbers */}
                    <div className="grid grid-cols-3 gap-2">
                        <div className="text-sm text-gray-500 col-span-1 self-start pt-1">Included Orders</div>
                        <div className="flex items-start gap-2 text-sm font-medium text-gray-700 col-span-2">
                            <Hash className="w-4 h-4 text-blue-500 flex-shrink-0 mt-1" />
                            {/* Use orderNumbers here */}
                            {orderNumbers.length > 0 ? (
                                <div className="flex flex-col space-y-1 max-h-40 overflow-y-auto custom-scrollbar pr-1">
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
                </div>
            </CardContent>
        </Card>
    )
}
