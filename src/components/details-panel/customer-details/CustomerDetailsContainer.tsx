'use client';

import { memo, useCallback, useEffect, useMemo } from 'react';
import { cn } from "@/lib/utils";
import { CustomerHeader } from "./CustomerHeader";
import { CustomerInfoCard } from "./CustomerInfoCard";
import { CustomerAddressesCard } from "./CustomerAddressesCard"; // Create this
import { CustomerContactsCard } from "./CustomerContactsCard";   // Create this
import { Button } from '@/components/ui/button';
import { useCustomersStore, useSelectedCustomerId, useSelectedCustomerData } from '@/stores/customer-store'; // Use customer store
import Loading from '@/components/ui/loading';
import { useCustomerByIdQuery } from '@/hooks/data/useCustomers'; // Use customer query hook

interface CustomerDetailsContainerProps {
    isMobile: boolean;
    className?: string;
}

export const CustomerDetailsContainer = memo(function CustomerDetailsContainer({
    isMobile,
    className
}: CustomerDetailsContainerProps) {
    const customerId = useSelectedCustomerId();
    const storedCustomerData = useSelectedCustomerData();
    const selectCustomer = useCustomersStore(state => state.selectCustomer);

    const {
        isLoading: isQueryLoading,
        isFetching: isQueryFetching,
        isError,
        error,
        isSuccess,
        data: freshCustomer
    } = useCustomerByIdQuery(customerId);

    // --- Effect to update the store ---
    useEffect(() => {
        if (isSuccess && freshCustomer) {
            // Assuming customerId is part of freshCustomer or use the hook's customerId
            selectCustomer(freshCustomer.customerId, freshCustomer);
        }
    }, [ isSuccess, freshCustomer, selectCustomer ]);

    // --- Determine the primary data source to display ---
    const displayData = useMemo(() => {
        // Prioritize fresh data if successful, otherwise use stored data
        return isSuccess ? freshCustomer : storedCustomerData;
    }, [ isSuccess, freshCustomer, storedCustomerData ]);

    // --- Loading and Error States ---
    const showFullScreenLoading = isQueryLoading && !displayData;
    const showBasicInfoLoading = !displayData || (isQueryFetching && !isSuccess); // Show loading if no data OR fetching without success yet
    const showErrorState = isError || (!isQueryLoading && !isQueryFetching && !displayData && !!customerId);

    const handleClose = useCallback(() => {
        selectCustomer(null, null);
    }, [ selectCustomer ]);

    // --- Styling ---
    const containerClass = cn(
        "flex flex-col",
        isMobile
            ? "h-screen w-screen fixed inset-0 z-50 bg-gradient-to-br from-green-100 via-teal-100 to-cyan-100" // Adjusted gradient
            : "mb-12 p-4 bg-gradient-to-br from-green-100 via-teal-100 to-cyan-100 rounded-lg border border-2 border-slate-200 w-[40%]", // Adjusted gradient
        className
    );

    const cardClass = cn(
        "bg-white/80 backdrop-blur-sm flex flex-col h-full",
        isMobile
            ? ""
            : "rounded-lg shadow-xl transition-all hover:shadow-2xl"
    );

    // --- Render Logic ---

    // 1. Handle No Selected Customer
    if (!customerId) {
        return (
            <div className={cn(containerClass, !isMobile && "items-center justify-center")}>
                {!isMobile && <p className="text-gray-500">Select a customer to view details.</p>}
            </div>
        );
    }

    // 2. Handle Initial Full Screen Loading State
    if (showFullScreenLoading) {
        return (
            <div className={containerClass}>
                <div className={cn("max-w-4xl mx-auto w-full h-full", cardClass)}>
                    <div className={`${isMobile ? "p-4" : "p-6"} flex justify-center items-center h-full`}>
                        <Loading />
                    </div>
                </div>
            </div>
        );
    }

    // 3. Handle Error State
    if (showErrorState) {
        return (
            <div className={containerClass}>
                <div className={cn("max-w-4xl mx-auto w-full h-full", cardClass, isMobile ? "p-4" : "p-6")}>
                    <div className="text-center text-red-600">
                        <p className='font-semibold mb-2'>Error loading customer details.</p>
                        {isError && <p className='text-sm text-gray-600 mb-4'>{error instanceof Error ? error.message : 'An unknown error occurred.'}</p>}
                        {!isError && !displayData && <p className='text-sm text-gray-600 mb-4'>Customer data could not be found.</p>}
                        <Button onClick={handleClose} variant="outline" size="sm">
                            Close Details
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    // 4. Safeguard: If we reach here without displayData
    if (!displayData) {
        console.error("CustomerDetailsContainer reached render stage without displayData. State:", { customerId, isQueryLoading, isQueryFetching, isSuccess, isError, storedCustomerData, freshCustomer });
        return (
            <div className={containerClass}>
                <div className={cn("max-w-4xl mx-auto w-full h-full", cardClass, isMobile ? "p-4" : "p-6")}>
                    <p className="text-center text-gray-500">Loading customer details...</p>
                </div>
            </div>
        );
    }

    const addresses = useMemo(() => {
        return displayData.addresses
            ? displayData.addresses.map((item) => ({
                ...item.address,
                entityAddressId: item.address.addressId  // Ensure entityAddressId is passed
            }))
            : [];
    }, [ displayData ]);
    const contacts = useMemo(() => {
        return displayData.contacts
            ? displayData.contacts.map((item) => ({
                ...item.contactDetail,
                entityContactId: item.contactDetail.contactDetailsId  // Ensure entityAddressId is passed
            }))
            : [];
    }, [ displayData ]);
    return (
        <div className={containerClass}>
            <div className={cn("max-w-4xl mx-auto w-full", cardClass)}>
                <div className={`${isMobile ? "pt-2 px-0" : "p-6 pb-2 pt-2 mt-0 border-b"} flex items-center justify-between bg-white/70 backdrop-blur-md rounded-t-lg z-10 sticky top-0`}>
                    <CustomerHeader isMobile={isMobile} handleClose={handleClose} isLoading={showBasicInfoLoading} />
                </div>
                <div className={`${isMobile ? "px-0 pb-4" : "px-6 pb-6"} overflow-y-auto flex-1`}>
                    <div className={`${isMobile ? "px-4" : ""}`}>
                        <CustomerInfoCard customer={displayData} isLoading={showBasicInfoLoading} />
                        <CustomerAddressesCard addresses={addresses ?? []} isLoading={showBasicInfoLoading} />
                        <CustomerContactsCard contacts={contacts ?? []} isLoading={showBasicInfoLoading} />
                        {/* Add other cards for related data (Users, Items) here */}
                    </div>
                </div>
            </div>
        </div>
    );
});