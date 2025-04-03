'use client';

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit, Printer, X } from "lucide-react";
import { format } from "date-fns";
import { StatusDropdown } from "./StatusDropdown";
import { CreateOrderDialog } from "../order-form/create-order-dialog";
import { useSelectedOrderData } from "@/stores/orders-store";
import { cn } from "@/lib/utils";

interface OrderHeaderProps {
  handleClose: () => void;
  isMobile: boolean;
}

export function OrderHeader({
  handleClose,
  isMobile
}: OrderHeaderProps) {
  // Access order data directly from store
  const order = useSelectedOrderData();
  
  // Safety check
  if (!order) {
    return null;
  }
  
  const { createdAt, orderNumber } = order;
  const formattedDate = format(new Date(createdAt), 'MMM d, yyyy');
  
  return (
    <div className={cn(
      "flex flex-row justify-between items-start md:items-center gap-4 w-full",
      isMobile && "px-4 pb-2"
    )}>
      <div className={cn("flex gap-2 ", isMobile ? 'flex-colZ' : '')}>
      {/* <div className={cn("flex gap-2 flex-wrap", isMobile ? 'flex-col' : '')}> */}
        <Badge
          variant="outline"
          className="h-7 px-3 text-lg font-bold border-2 border-black bg-white rounded-full"
        >
          <p className="whitespace-nowrap">{isMobile ? '#' : 'Order #'}{orderNumber}</p>
        </Badge>
        <StatusDropdown />
      </div>
      <div className="flex flex-wrap gap-2">
        <Button
          className="gap-2 bg-blue-500 hover:bg-blue-600 transition-colors"
          size="sm"
        >
          <Printer className="w-4 h-4" />
        </Button>
        
        <CreateOrderDialog
          isEditMode={true}
          initialData={order}
        >
          <Button
            className="gap-2 bg-purple-500 hover:bg-purple-600 transition-colors"
            size="sm"
          >
            <Edit className="w-4 h-4" />
          </Button>
        </CreateOrderDialog>
        
        <Button
          variant='outline'
          className="gap-2 bg-red-50 hover:bg-red-400 transition-colors"
          size="sm"
          onClick={handleClose}
        >
          <X className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}