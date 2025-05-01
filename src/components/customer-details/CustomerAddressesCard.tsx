'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AddressDetails } from "@/server/db/schema";
import { customerSchema, EnrichedCustomer } from "@/types/customer";
import { MapPin, Home, Building, Truck } from "lucide-react"; // Icons for addresses
import { z } from "zod";


interface CustomerAddressesCardProps {
    addresses: (AddressDetails & { entityAddressId: string })[]; // Expect enriched address data
    isLoading: boolean;
}

export function CustomerAddressesCard({ addresses, isLoading }: CustomerAddressesCardProps) {

    const getAddressIcon = (type?: string | null) => {
        switch (type?.toUpperCase()) {
            case 'SHIPPING': return <Truck className="w-4 h-4 text-blue-500" />;
            case 'BILLING': return <Building className="w-4 h-4 text-green-500" />;
            case 'PRIMARY': return <Home className="w-4 h-4 text-purple-500" />;
            default: return <MapPin className="w-4 h-4 text-gray-500" />;
        }
    };

    const formatAddress = (addr: AddressDetails) => {
        const parts = [ addr.address1, addr.address2, addr.city, addr.postalCode, addr.country ];
        return parts.filter(Boolean).join(', ');
    };

    if (isLoading) {
        return (
            <Card className="mt-6 bg-white/70 shadow-md hover:shadow-lg transition-shadow">
                <CardHeader className="p-4"><CardTitle className="text-lg text-gray-700">Addresses</CardTitle></CardHeader>
                <CardContent className="p-4 pt-0 space-y-3">
                    <Skeleton className="h-6 w-full" />
                    <Skeleton className="h-6 w-5/6" />
                </CardContent>
            </Card>
        );
    }

    if (!addresses || addresses.length === 0) {
        return (
            <Card className="mt-6 bg-white/70 shadow-md hover:shadow-lg transition-shadow">
                <CardHeader className="p-4"><CardTitle className="text-lg text-gray-700">Addresses</CardTitle></CardHeader>
                <CardContent className="p-4 pt-0">
                    <p className="text-center text-gray-500 py-4">No addresses found for this customer.</p>
                    {/* Add Button to add address later */}
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="mt-6 bg-white/70 shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="p-4"><CardTitle className="text-lg text-gray-700">Addresses</CardTitle></CardHeader>
            <CardContent className="p-4 pt-0 space-y-3">
                {addresses.map((addr) => (
                    <div key={addr.addressId || addr.addressId} className="flex items-start gap-3 p-2 border-b last:border-b-0">
                        <div className="pt-1">{getAddressIcon(addr.addressType)}</div>
                        <div>
                            <p className="text-sm font-medium text-gray-800">{formatAddress(addr)}</p>
                            {addr.addressType && <p className="text-xs text-gray-500">{addr.addressType}</p>}
                        </div>
                    </div>
                ))}
            </CardContent>
        </Card>
    );
}