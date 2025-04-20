// src/app/(pages)/(protected)/warehouse/expenses/components/ExpenseHeader.tsx
'use client'

import { QuickAccess } from "@/components/quick-access"
// Removed: import { usePathname, useRouter, useSearchParams } from "next/navigation"
import CreateExpenseButton from "./CreateExpenseButton"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import SearchPanel from "./SearchPanel"
import { Trash2Icon } from "lucide-react" // Keep if clear button remains here
import { Button } from "@/components/ui/button" // Keep if clear button remains here
// Removed: import { useCallback } from "react"
import { orderExpenseStatusTypesSchema } from '@/server/db/schema';
import { z } from 'zod';

interface ExpenseHeaderProps {
    currentStatus: z.infer<typeof orderExpenseStatusTypesSchema> | null; // Controlled status from parent
    onStatusChange: (status: z.infer<typeof orderExpenseStatusTypesSchema> | null) => void; // Callback to parent
  currentSearch: string; // Pass search down to SearchPanel
  onSearchChange: (value: string) => void; // Pass search handler down
  onClearAll?: () => void; // Optional: Handler for a global clear button
}

export default function ExpenseHeader({
  currentStatus,
  onStatusChange,
  currentSearch,
  onSearchChange,
  onClearAll // Use this prop if the clear button is meant to clear more than just search
}: ExpenseHeaderProps) {

  // Removed: router, pathname, searchParams, handleStatusChange

  // Map internal Tabs value ('ALL') to null for the handler
  const handleTabChange = (value: string) => {
    const newStatus = value === 'ALL' ? null : value as z.infer<typeof orderExpenseStatusTypesSchema>;
    onStatusChange(newStatus);
  };

  // Determine the active tab value ('ALL' or status)
  const activeTabValue = currentStatus === null ? 'ALL' : currentStatus;

  return (
    <div className="flex justify-between items-center mt-2 pb-2 gap-2 max-w-full"> {/* Use items-center */}
      <div className="flex items-center gap-2"> {/* Group heading and tabs */}
        <h1 className="text-2xl font-bold text-gray-900 text-nowrap">
          Expenses
        </h1>
        {/* Controlled Tabs */}
        <Tabs value={activeTabValue} onValueChange={handleTabChange}>
          <TabsList>
            <TabsTrigger value="ALL">All</TabsTrigger>
            <TabsTrigger value="PENDING">Pending</TabsTrigger>
            <TabsTrigger value="DONE">Done</TabsTrigger>
            {/* Add other statuses if needed */}
          </TabsList>
        </Tabs>
      </div>

      <div className="flex items-center gap-2"> {/* Group search and clear */}
        <SearchPanel
          initialValue={currentSearch} // Pass initial value down
          onSearchChange={onSearchChange} // Pass handler down
          // The clear button inside SearchPanel should ideally only clear search
          // If you need a button here to clear *all* filters/sorts, use onClearAll
        />
        {/* Optional: Global Clear Button */}
        {onClearAll && (
            <Button
                variant="outline"
                size="icon"
                onClick={onClearAll}
                title="Clear all filters and sorting"
            >
                <Trash2Icon className="h-4 w-4" />
            </Button>
        )}
      </div>

      <div className="flex items-center gap-2"> {/* Group actions */}
        <CreateExpenseButton />
        <QuickAccess />
      </div>
    </div>
  )
}
