'use client';

import { memo, useCallback } from 'react';
import { cn } from "@/lib/utils";
import { OrderHeader } from "./OrderHeader";
import { OrderInfoCard } from "./OrderInfoCard";
import { OrderItemsTable } from "./OrderItemsTable";
import { OrderNotesCard } from "./OrderNotesCard";
import { useOrderDetails } from '@/hooks/data-fetcher';
import { ChevronLeft, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useOrdersStore } from '@/stores/orders-store';
import { StatusDropdown } from './StatusDropdown';
import Loading from '@/components/ui/loading';

interface OrderDetailsContainerProps {
  orderId: string;
  isMobile: boolean;
}

export const OrderDetailsContainer = memo(function OrderDetailsContainer({
  orderId,
  isMobile
}: OrderDetailsContainerProps) {
  const { selectOrder } = useOrdersStore();
  
  // Fetch detailed order data with optimized hook
  const { 
    data: orderData, 
    isLoading, 
    isError, 
    error 
  } = useOrderDetails(orderId);

  const handleClose = useCallback(() => {
    selectOrder(null);
  }, [selectOrder]);

  // Loading and error states
  if (isLoading) {
    return (
      <div className={cn(
        "bg-white rounded-md border relative transition-all duration-300 flex flex-col items-center justify-center flex-1 overflow-auto",
        isMobile ? "fixed inset-0 z-50 m-0" : "w-[40%]"
      )}>
        <Loading />
      </div>
    );
  }

  if (isError || !orderData) {
    return (
      <div className={cn(
        "bg-white rounded-md border relative transition-all duration-300 flex flex-col items-center justify-center flex-1 overflow-auto",
        isMobile ? "fixed inset-0 z-50 m-0" : "w-[40%]"
      )}>
        <div className="text-red-600 mb-4">
          Error loading order: {error instanceof Error ? error.message : 'Unknown error'}
        </div>
        <Button onClick={handleClose} variant="outline">Close</Button>
      </div>
    );
  }

  return (
    <div className={cn(
      "bg-white rounded-md border relative transition-all duration-300 flex-1 overflow-auto",
      isMobile ? "fixed inset-0 z-50 m-0" : "w-[40%]"
    )}>
      {/* Close button for mobile */}
      {isMobile && (
        <Button 
          variant="ghost" 
          size="icon" 
          className="absolute top-2 left-2 z-50" 
          onClick={handleClose}
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
      )}

      {/* Close button for desktop */}
      {!isMobile && (
        <Button 
          variant="ghost" 
          size="icon" 
          className="absolute top-2 right-2 z-50" 
          onClick={handleClose}
        >
          <X className="h-5 w-5" />
        </Button>
      )}

      <div className="p-4 space-y-4">
        <OrderHeader 
          orderNumber={orderData.orderNumber} 
          status={orderData.status}
          createdAt={orderData.createdAt}
        />

        <div className="flex justify-between items-center">
          <h2 className="text-lg font-medium">Order Details</h2>
          <StatusDropdown 
            currentStatus={orderData.status} 
            orderId={orderData.orderId}
          />
        </div>

        <OrderInfoCard
          customerId={orderData.customerId}
          customerName={orderData.customerName}
          orderType={orderData.orderType}
          movement={orderData.movement}
          packingType={orderData.packingType}
          deliveryMethod={orderData.deliveryMethod}
        />

        <OrderItemsTable items={orderData.items} />

        <OrderNotesCard 
          notes={orderData.notes || ""} 
          orderId={orderData.orderId}
        />
      </div>
    </div>
  );
});

export default OrderDetailsContainer;