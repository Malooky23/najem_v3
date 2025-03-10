import { CreateOrderDialog } from "./order-form/create-order-dialog";
import OrderFilters from "./order-filters/OrderFilters";
import { useOrdersStore } from "@/stores/orders-store";
import { OrderStatus, MovementType } from "@/types/orders";
import { CustomerList } from "@/types/customer";

interface PageHeaderProps {
  isMobile: boolean;
  isFetching: boolean;
  customers: CustomerList[] | undefined;
  isLoadingCustomers: boolean;
    onStatusChange: (value: OrderStatus | null) => void;
    onCustomerChange: (value: string | null) => void;
    onMovementChange: (value: MovementType | null) => void;
    onDateRangeChange: (from: Date | null, to: Date | null) => void;
    onResetFilters: () => void;
    filters: any
}

export function PageHeader({ isMobile, isFetching, customers, isLoadingCustomers, onStatusChange, onCustomerChange, onMovementChange, onDateRangeChange, onResetFilters, filters }: PageHeaderProps) {

  return (
    <>
      <div className="flex justify-between m-2">
        <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
        <CreateOrderDialog isMobile={isMobile} />
      </div>
      <OrderFilters
        status={filters.status || null}
        customerId={filters.customerId || null}
        movement={filters.movement || null}
        dateRange={filters.dateRange || null}
        isLoading={isFetching}
        onStatusChange={onStatusChange}
        onCustomerChange={onCustomerChange}
        onMovementChange={onMovementChange}
        onDateRangeChange={onDateRangeChange}
        onResetFilters={onResetFilters}
        customers={customers}
        isLoadingCustomers={isLoadingCustomers}
      />
    </>
  );
}