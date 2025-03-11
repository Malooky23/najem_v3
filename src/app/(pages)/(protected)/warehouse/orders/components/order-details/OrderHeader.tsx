'use client';

import { OrderStatus } from "@/types/orders";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

interface OrderHeaderProps {
  orderNumber: number;
  status: OrderStatus;
  createdAt: Date;
}

export function OrderHeader({
  orderNumber,
  status,
  createdAt
}: OrderHeaderProps) {
  const formattedDate = format(new Date(createdAt), 'MMM d, yyyy');
  
  return (
    <div className="flex flex-col space-y-2">
      <div className="flex items-center justify-between">
        <Badge 
          variant="outline" 
          className="text-lg font-bold border-2 border-black rounded-full px-3 py-1"
        >
          Order #{orderNumber}
        </Badge>
        <span className="text-sm text-gray-500">{formattedDate}</span>
      </div>
    </div>
  );
}