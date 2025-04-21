// src/app/(pages)/(protected)/warehouse/expenses/components/table/ExpensesTable.tsx
'use client';
import React, { useMemo } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { OnChangeFn, PaginationState, SortingState } from '@tanstack/react-table';
import { z } from 'zod';

import { DataTable } from '@/components/ui/data-table1';
import { expenseColumns } from './columns';
import { EnrichedOrderExpenseSchemaType, ExpenseFilters, ExpenseSort, ExpenseSortFields } from '@/types/expense';
import { useOrderExpenses } from '@/hooks/data/useExpenses';
import { orderExpenseStatusTypesSchema } from '@/server/db/schema';
import { DateRange } from 'react-day-picker';
import { useDebounce } from 'use-debounce';

interface ExpensesTableProps {
  pagination: PaginationState;
  sorting: SortingState;
  viewId: string | null;
  searchInput: string;
  statusFilter: z.infer<typeof orderExpenseStatusTypesSchema> | null;
  dateFilter?: DateRange | null;
  currentState: ExpenseFilters;
  onPaginationChange: OnChangeFn<PaginationState>;
  onSortingChange: OnChangeFn<SortingState>;
  onViewChange: (viewId: string | null) => void;
}

export function ExpensesTable({
  pagination,
  sorting,
  viewId,
  searchInput,
  statusFilter,
  dateFilter,
  currentState,
  onPaginationChange,
  onSortingChange,
  onViewChange,
}: ExpensesTableProps) {

  const queryClient = useQueryClient();
  // No longer need to debounce here, the prop `searchInput` is already debounced by the parent page
const [debounceCurrentState] = useDebounce(currentState, 500);

  // === Prepare Filters and Sort for API ===
  const filtersForApi = useMemo<ExpenseFilters>(() => {
    const filters: ExpenseFilters = {};
    filters.status = statusFilter ?? undefined;
    if (dateFilter?.from && dateFilter?.to){
      filters.dateRange = dateFilter
    }
    filters.orderNumber = currentState.orderNumber;
    filters.customerId = currentState.customerId;
    filters.expenseItemName = currentState.expenseItemName;
    // Use the searchInput prop directly (it's already debounced)
    if (searchInput) {
      filters.search = searchInput;
    } else {
      filters.search = undefined; // Ensure it's explicitly undefined if empty // Ensure it's explicitly undefined if empty
    }
    return filters;
  }, [ statusFilter, searchInput, debounceCurrentState ]); // Depend on searchInput prop now

  const sortForApi = useMemo<ExpenseSort>(() => ({
    field: (sorting.length > 0 ? sorting[0].id : 'createdAt') as ExpenseSortFields,
    direction: sorting.length > 0 && !sorting[0].desc ? 'asc' : 'desc',
  }), [ sorting ]);

  // === TanStack Query ===
  // Pass individual, stable parameters to the hook
  const queryResult = useOrderExpenses({
      page: pagination.pageIndex + 1,
      pageSize: pagination.pageSize,
      filters: filtersForApi, // Pass the memoized filters object
      sort: sortForApi,       // Pass the memoized sort object
  });

  const handleRowClick = (order: EnrichedOrderExpenseSchemaType) => {
    // Optional internal logic
  };

  // === Render ===
  return (
    <div className="flex-grow min-h-0">
      <DataTable
        columns={expenseColumns}
        data={queryResult.data?.data?.data ?? []}
        pageCount={queryResult.data?.data?.pagination?.totalPages ?? -1}
        rowCount={queryResult.data?.data?.pagination?.total ?? 0}
        pagination={pagination}
        sorting={sorting}
        onPaginationChange={onPaginationChange}
        onSortingChange={onSortingChange}
        currentViewId={viewId}
        onViewChange={onViewChange}
        isLoading={queryResult.isLoading}
        // Show fetching state whenever the query is fetching (searchInput prop is debounced)
        isFetching={queryResult.isFetching}
        isError={queryResult.isError}
        error={queryResult.error}
        rowIdKey="orderExpenseId"
        onRowClick={handleRowClick}
      />
    </div>
  );
}
