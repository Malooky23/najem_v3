'use client'

import { QuickAccess } from "@/components/quick-access"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import CreateExpenseButton from "./CreateExpenseButton"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import SearchPanel from "./SearchPanel" // Ensure SearchPanel also preserves params correctly
import { Trash2Icon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useCallback } from "react" // Import useCallback

export default function ExpenseHeader() {
    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()

    // Helper function to update status param while preserving others
    // Use useCallback to memoize the function if needed, though less critical here
    const handleStatusChange = useCallback((newStatus: string | null) => {
        // Create a mutable copy of the current search params
        const currentParams = new URLSearchParams(searchParams.toString());

        if (newStatus) {
            // Set the new status
            currentParams.set('status', newStatus);
        } else {
            // Delete the status param if newStatus is null (for "All")
            currentParams.delete('status');
        }

        // OPTIONAL BUT RECOMMENDED: Reset page to 1 when changing a major filter
        currentParams.set('page', '1');

        // Push the updated params, preserving others (like sorting, search)
        router.push(`${pathname}?${currentParams.toString()}`);
    }, [ searchParams, pathname, router ]); // Dependencies for useCallback

    // Determine the active tab based on the URL 'status' param for controlled Tabs
    const activeStatus = searchParams.get('status') || 'ALL'; // Default to 'ALL' if param missing






    return (
        <div className="flex justify-between items-center mt-2 pb-2 gap-2 max-w-full"> {/* Use items-center */}
            <div className="flex items-center gap-2"> {/* Group heading and tabs */}
                <h1 className="text-2xl font-bold text-gray-900 text-nowrap">
                    Expenses
                </h1>
                {/* Make Tabs controlled by URL state */}
                <Tabs value={activeStatus} onValueChange={(value) => {
                    // Map the Tabs value ('ALL') back to null for the handler
                    handleStatusChange(value === 'ALL' ? null : value);
                }}>
                    <TabsList> {/* No defaultValue needed when value is controlled */}
                        {/* Use value prop on Trigger, let Tabs handle state via onValueChange */}
                        <TabsTrigger value="ALL">All</TabsTrigger>
                        <TabsTrigger value="PENDING">Pending</TabsTrigger>
                        <TabsTrigger value="DONE">Done</TabsTrigger>
                    </TabsList>
                </Tabs>
            </div>

            <div className="flex items-center gap-2"> {/* Group search and clear */}
                <SearchPanel /> {/* Ensure SearchPanel preserves params */}
            </div>

            <div className="flex items-center gap-2"> {/* Group actions */}
                <CreateExpenseButton />
                <QuickAccess />
            </div>
        </div>
    )
}
