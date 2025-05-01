'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Building, Globe, Hash, Info, UserCircle2, FileText } from "lucide-react"; // Relevant icons
import { Skeleton } from "@/components/ui/skeleton";

import { CollapsibleNotes } from "@/components/order-details/OrderInfoCard"; // Re-use collapsible notes
import { EnrichedCustomer } from "@/types/customer";

interface CustomerInfoCardProps {
    customer: EnrichedCustomer;
    isLoading: boolean;
}

interface InfoItemProps {
    icon: React.ElementType;
    label: string;
    value: string | number | null | undefined;
    isLoading: boolean;
    iconColorClass?: string;
}

const InfoItem: React.FC<InfoItemProps> = ({ icon: Icon, label, value, isLoading, iconColorClass = "text-gray-500" }) => (
    <div className="space-y-1">
        <label className="text-xs text-gray-500">{label}</label>
        {isLoading ? (
            <Skeleton className="h-5 w-3/4" />
        ) : (
            <div className={`flex items-center gap-2 text-sm font-medium text-gray-700 ${!value ? 'text-gray-400 italic' : ''}`}>
                <Icon className={`w-4 h-4 ${iconColorClass}`} />
                <span className="truncate">{value || "-"}</span>
            </div>
        )}
    </div>
);

export function CustomerInfoCard({ customer, isLoading }: CustomerInfoCardProps) {
    const {
        displayName,
        customerType,
        country,
        zohoCustomerId,
        notes,
        individual,
        business
    } = customer;

    return (
        <Card className="bg-white/70 shadow-md hover:shadow-lg transition-shadow mt-2">
            <CardHeader className="p-4">
                <CardTitle className="text-lg text-gray-700 flex justify-between items-center">
                    <p>Customer Information</p>
                    {/* Add any header actions if needed */}
                </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-4 items-start">

                    <InfoItem icon={User} label="Display Name" value={displayName} isLoading={isLoading} iconColorClass="text-blue-500" />
                    <InfoItem icon={Info} label="Customer Type" value={customerType} isLoading={isLoading} iconColorClass="text-purple-500" />
                    <InfoItem icon={Globe} label="Country" value={country} isLoading={isLoading} iconColorClass="text-green-500" />
                    <InfoItem icon={Hash} label="Zoho ID" value={zohoCustomerId} isLoading={isLoading} iconColorClass="text-orange-500" />

                    {/* Conditional Fields based on Type */}
                    {customerType === 'INDIVIDUAL' && individual && (
                        <>
                            <InfoItem icon={UserCircle2} label="First Name" value={individual.firstName} isLoading={isLoading} iconColorClass="text-indigo-500" />
                            <InfoItem icon={UserCircle2} label="Last Name" value={individual.lastName} isLoading={isLoading} iconColorClass="text-indigo-500" />
                            {/* Add Middle Name, Personal ID if needed */}
                        </>
                    )}

                    {customerType === 'BUSINESS' && business && (
                        <>
                            <InfoItem icon={Building} label="Business Name" value={business.businessName} isLoading={isLoading} iconColorClass="text-teal-500" />
                            <InfoItem icon={FileText} label="Tax Number" value={business.taxNumber} isLoading={isLoading} iconColorClass="text-pink-500" />
                            {/* Add isTaxRegistered if needed */}
                        </>
                    )}
                </div>

                {/* Notes Section */}
                <div className="mt-6 space-y-1">
                    <label className="text-xs text-gray-500">Notes</label>
                    {isLoading ? (
                        <div className="space-y-1">
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-5/6" />
                        </div>
                    ) : (
                        <div>
                            {notes && notes.length > 80 ? (
                                <CollapsibleNotes text={notes} />
                            ) : (
                                <p className="text-sm text-gray-600 text-wrap break-words">
                                    {notes || "No notes available."}
                                </p>
                            )}
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}