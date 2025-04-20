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
import { useDebounce } from '@/hooks/useDebounce';
import { orderExpenseStatusTypesSchema } from '@/server/db/schema';

interface ExpensesTableProps {
  pagination: PaginationState;
  sorting: SortingState;
  viewId: string | null;
  searchInput: string;
  statusFilter: z.infer<typeof orderExpenseStatusTypesSchema> | null;
  // dateFilter?: { from: Date; to: Date } | null;

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
  // dateFilter,
  onPaginationChange,
  onSortingChange,
  onViewChange,
}: ExpensesTableProps) {

  const queryClient = useQueryClient();
  const debouncedSearch = useDebounce(searchInput, 300); // Debounce search input

  // === Prepare Filters and Sort for API ===
  const filtersForApi = useMemo<ExpenseFilters>(() => {
    const filters: ExpenseFilters = {};
    filters.status = statusFilter ?? undefined;
    // filters.dateRange = dateFilter ?? undefined; // Add if needed

    // Use the debounced search term for the API filter
    if (debouncedSearch) {
      filters.search = debouncedSearch;
    } else {
      filters.search = undefined;
    }
    return filters;
  }, [ statusFilter, debouncedSearch /*, dateFilter */ ]); // Depend on debouncedSearch

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
        // Still hide fetching state during rapid typing for better UX
        isFetching={queryResult.isFetching && (searchInput === debouncedSearch)}
        isError={queryResult.isError}
        error={queryResult.error}
        rowIdKey="orderExpenseId"
        onRowClick={handleRowClick}
      />
    </div>
  );
}
