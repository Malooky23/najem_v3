import { memo, useState, useCallback } from 'react';
import { cn } from "@/lib/utils";
import { EnrichedOrders, OrderSort } from "@/types/orders";
import { RowSelectionState } from "@tanstack/react-table";
import { OrdersTable } from "./orders-table";
import { ordersColumns } from "./orders-columns";
import { PaginationControls } from "@/components/ui/pagination-controls";

interface OrdersTableContainerProps {
  isDetailsOpen: boolean;
  isMobile: boolean;
  orders: EnrichedOrders[];
  selectedOrderId: string | null;
  isLoading: boolean;
  isFetching?: boolean; // New prop for background loading
  pagination: any;
  sort: OrderSort;
  onOrderClick: (order: EnrichedOrders) => void;
  onSortChange: (field: string, direction: 'asc' | 'desc') => void;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}

// Memoized table container component
const OrdersTableContainer = memo(function OrdersTableContainer({
  isDetailsOpen,
  isMobile,
  orders,
  selectedOrderId,
  isLoading,
  isFetching = false,
  pagination,
  sort,
  onOrderClick,
  onSortChange,
  onPageChange,
  onPageSizeChange
}: OrdersTableContainerProps) {
  const [selectedRows, setSelectedRows] = useState<RowSelectionState>({});
  
  const handleRowSelection = useCallback((selection: RowSelectionState) => {
    setSelectedRows(selection);
  }, []);

  const selectedCount = Object.keys(selectedRows)
    .filter(key => selectedRows[key])
    .length;

  return (
    <div
      className={cn(
        "flex flex-col rounded-md transition-all duration-300",
        isMobile ? (isDetailsOpen ? "hidden" : "w-full") : (isDetailsOpen ? "w-[40%]" : "w-full"),
      )}
    >
      <div className="flex-1 overflow-hidden flex flex-col rounded-lg bg-slate-50 border-2 border-slate-200 relative">
        {/* Subtle loading indicator that doesn't block UI */}
        {isFetching && !isLoading && (
          <div className="absolute top-0 left-0 w-full h-0.5 bg-blue-500 animate-pulse z-10" />
        )}
        
        <OrdersTable
          columns={ordersColumns}
          data={orders}
          isLoading={isLoading} // Only true for initial load with no data
          onRowClick={onOrderClick}
          selectedId={selectedOrderId || undefined}
          isCompact={isDetailsOpen || isMobile}
          onSort={onSortChange}
          sortField={sort.field}
          sortDirection={sort.direction}
          onRowSelectionChange={handleRowSelection}
          selectedRows={selectedRows}
          pageSize={pagination?.pageSize}
        />
      </div>
      {pagination && (
        <div className="p-2 flex w-full justify-center min-w-0">
          <PaginationControls
            currentPage={pagination.currentPage}
            totalPages={pagination.totalPages}
            pageSize={pagination.pageSize}
            total={pagination.total}
            onPageChange={onPageChange}
            onPageSizeChange={onPageSizeChange}
            selectedRows={selectedCount}
            isLoading={isFetching && !isLoading} // Show subtle loading in pagination
          />
        </div>
      )}
    </div>
  );
});

export default OrdersTableContainer;
