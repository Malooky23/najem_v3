'use client';

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit, MoreVertical, Printer, Trash, User, X } from "lucide-react"; // Added User icon
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { useMediaQuery } from "@/hooks/use-media-query";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Dialog } from "@/components/ui/dialog";
// import { CreateCustomerDialog } from "@/components/dialogs/CustomerDialog/create-customer-dialog"; // Assuming you have/will create this
import { useSession } from "next-auth/react";
import { useSelectedCustomerData } from "@/stores/customer-store";
import CustomerModalWrapper from "../dialogs/CustomerDialog/CustomerModalWrapper";
import DeleteCustomerDialog from "../dialogs/CustomerDialog/DeleteCustomer";

interface CustomerHeaderProps {
    handleClose: () => void;
    isMobile: boolean;
    isLoading: boolean;
}

function CustomerHeaderLeftSkeleton() {
    return (
        <div className="flex items-center gap-2">
            <Skeleton className="h-7 w-7 rounded-full" /> {/* Icon placeholder */}
            <Skeleton className="h-6 w-32 rounded-md" /> {/* Name placeholder */}
            <Skeleton className="h-5 w-20 rounded-full" /> {/* Number placeholder */}
        </div>
    );
}

interface CustomerHeaderRightSkeletonProps {
    handleClose: () => void;
}

function CustomerHeaderRightSkeleton({ handleClose }: CustomerHeaderRightSkeletonProps) {
    return (
        <div className="flex flex-wrap gap-2">
            <Skeleton className="h-8 w-10 rounded-md" />
            <Skeleton className="h-8 w-10 rounded-md" />
            <Button
                variant='outline'
                className="gap-2 bg-red-50 hover:bg-red-400 transition-colors"
                size="sm"
                onClick={handleClose}
            >
                <X className="w-4 h-4" />
            </Button>
        </div>
    );
}

export function CustomerHeader({
    handleClose,
    isMobile,
    isLoading
}: CustomerHeaderProps) {
    const customer = useSelectedCustomerData();
    const isWideScreen = useMediaQuery('(min-width: 720px)');
    const { data: session } = useSession();

    if (isLoading) {
        return (
            <div className={cn("flex flex-row justify-between items-start md:items-center gap-4 w-full", isMobile && "px-4 pb-2")}>
                <CustomerHeaderLeftSkeleton />
                {isWideScreen ? <CustomerHeaderRightSkeleton handleClose={handleClose} /> : <Skeleton className="h-8 w-10 rounded-md" />}
            </div>
        );
    }

    if (!customer) return null; // Safety check

    const { displayName, customerNumber } = customer;

    const actionButtons = (
        <>
            {/* <Button className="gap-2 bg-blue-500 hover:bg-blue-600 transition-colors" size="sm">
                <Printer className="w-4 h-4" /> {!isMobile && 'Print'}
            </Button> */}

            {/* {session?.user.userType === 'EMPLOYEE' && (
                <CreateCustomerDialog isEditMode={true} initialData={customer}>
                    <Button className="gap-2 bg-purple-500 hover:bg-purple-600 transition-colors" size="sm">
                        <Edit className="w-4 h-4" /> {!isMobile && 'Edit'}
                    </Button>
                </CreateCustomerDialog>
            )} */}

            {session?.user.userType === 'EMPLOYEE' && (
                <>
                    <CustomerModalWrapper isEditMode={true}>
                        <Button className="gap-2 bg-purple-500 hover:bg-purple-600 transition-colors" size="sm" > {/* Placeholder Edit */}
                            <Edit className="w-4 h-4" /> 
                        </Button>
                    </CustomerModalWrapper>
                    <DeleteCustomerDialog>

                        <Button variant="outline" className="gap-2  transition-colors" size="sm" > {/* Placeholder Edit */}
                            <Trash className="w-4 h-4" color="red" />
                        </Button>
                    </DeleteCustomerDialog>
                </>
            )}
        </>
    );

    return (
        <div className={cn("flex flex-row justify-between items-start md:items-center gap-4 w-full", isMobile && "px-4 pb-2")}>
            <div className="flex items-center gap-2 flex-wrap">
                <User className="w-6 h-6 text-gray-600" />
                <h2 className="text-lg font-semibold text-gray-800 truncate" title={displayName}>{displayName}</h2>
                <Badge variant="secondary" className="h-6 px-2 text-xs font-medium">
                    #{customerNumber}
                </Badge>
            </div>
            <div className="flex flex-wrap gap-2">
                {isWideScreen ? (
                    <>
                        {actionButtons}
                        <Button variant='outline' className="gap-2 bg-red-50 hover:bg-red-400 transition-colors" size="sm" onClick={handleClose}>
                            <X className="w-4 h-4" /> {!isMobile && 'Close'}
                        </Button>
                    </>
                ) : (
                    <Dialog> {/* Keep Dialog wrapper if CreateCustomerDialog uses it */}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild><Button variant="outline" size="sm"><MoreVertical className="h-4 w-4" /></Button></DropdownMenuTrigger>
                            <DropdownMenuContent className="w-40" align="end">
                                <DropdownMenuItem><Printer className="mr-2 h-4 w-4" /> Print</DropdownMenuItem>
                                {/* <CreateCustomerDialog isEditMode={true} initialData={customer}>
                  <DropdownMenuItem onSelect={(e) => e.preventDefault()}><Edit className="mr-2 h-4 w-4" /> Edit</DropdownMenuItem>
                </CreateCustomerDialog> */}
                                <DropdownMenuItem disabled><Edit className="mr-2 h-4 w-4" /> Edit</DropdownMenuItem> {/* Placeholder Edit */}
                                <DropdownMenuItem onClick={handleClose} className="text-red-500 focus:text-red-500"><X className="mr-2 h-4 w-4" /> Close</DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </Dialog>
                )}
            </div>
        </div>
    );
}