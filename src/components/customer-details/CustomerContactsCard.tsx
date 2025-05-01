'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ContactDetails } from "@/server/db/schema";
import { Mail, Phone, Smartphone, Info, Star } from "lucide-react"; // Icons for contacts

interface CustomerContactsCardProps {
    contacts: (ContactDetails & { entityContactId: string })[]; // Expect enriched contact data
    isLoading: boolean;
}

export function CustomerContactsCard({ contacts, isLoading }: CustomerContactsCardProps) {

    const getContactIcon = (type?: string | null) => {
        switch (type?.toLowerCase()) {
            case 'email': return <Mail className="w-4 h-4 text-red-500" />;
            case 'phone': return <Phone className="w-4 h-4 text-blue-500" />;
            case 'mobile': return <Smartphone className="w-4 h-4 text-green-500" />;
            default: return <Info className="w-4 h-4 text-gray-500" />;
        }
    };

    if (isLoading) {
        return (
            <Card className="mt-6 bg-white/70 shadow-md hover:shadow-lg transition-shadow">
                <CardHeader className="p-4"><CardTitle className="text-lg text-gray-700">Contact Details</CardTitle></CardHeader>
                <CardContent className="p-4 pt-0 space-y-3">
                    <Skeleton className="h-6 w-full" />
                    <Skeleton className="h-6 w-5/6" />
                </CardContent>
            </Card>
        );
    }

    if (!contacts || contacts.length === 0) {
        return (
            <Card className="mt-6 bg-white/70 shadow-md hover:shadow-lg transition-shadow">
                <CardHeader className="p-4"><CardTitle className="text-lg text-gray-700">Contact Details</CardTitle></CardHeader>
                <CardContent className="p-4 pt-0">
                    <p className="text-center text-gray-500 py-4">No contact details found for this customer.</p>
                    {/* Add Button to add contact later */}
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="mt-6 bg-white/70 shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="p-4"><CardTitle className="text-lg text-gray-700">Contact Details</CardTitle></CardHeader>
            <CardContent className="p-4 pt-0 space-y-3">
                {contacts.map((contact) => (
                    <div key={contact.entityContactId || contact.contactDetailsId} className="flex items-center gap-3 p-2 border-b last:border-b-0">
                        {getContactIcon(contact.contactType)}
                        <div className="flex-1">
                            <p className="text-sm font-medium text-gray-800 break-all">{contact.contactData}</p>
                            <p className="text-xs text-gray-500 capitalize">{contact.contactType}</p>
                        </div>
                        {contact.isPrimary && (
                            <div className="flex items-center gap-1 text-xs text-yellow-600" title="Primary Contact">
                                <Star className="w-3 h-3 fill-current" />
                                <span>Primary</span>
                            </div>
                        )}
                    </div>
                ))}
            </CardContent>
        </Card>
    );
}