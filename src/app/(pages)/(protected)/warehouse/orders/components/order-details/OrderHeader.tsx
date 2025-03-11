'use client';

import { OrderStatus } from "@/types/orders";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit, Printer, X } from "lucide-react";
import { format } from "date-fns";
import { StatusDropdown } from "./StatusDropdown";

interface OrderHeaderProps {
  orderNumber: number;
  status: OrderStatus;
  createdAt: Date;
  currentStatus: OrderStatus;
  orderId: string;
  handleClose: () => void;
}

export function OrderHeader({
  orderNumber,
  status,
  createdAt,
  currentStatus,
  orderId,
  handleClose
}: OrderHeaderProps) {
  const formattedDate = format(new Date(createdAt), 'MMM d, yyyy');

  return (
    <div className="flex justify-between items-center gap-4  w-full">
      <div className="flex gap-2">
      <Badge
        variant="outline"
        className="h-7 px-3 text-lg font-bold border-2 border-black bg-white rounded-full"
        >
        <p className="whitespace-nowrap">Order #{orderNumber}</p>
      </Badge>

      <StatusDropdown
        currentStatus={status}
        orderId={orderId}
        />
        </div>

        <div className="flex gap-2">
        <Button
          className="gap-2 bg-blue-500 hover:bg-blue-600 transition-colors"
          size="sm"
        >
          <Printer className="w-4 h-4" />
        </Button>
        <Button
          className="gap-2 bg-purple-500 hover:bg-purple-600 transition-colors"
          size="sm"
        >
          <Edit className="w-4 h-4" />
        </Button>
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