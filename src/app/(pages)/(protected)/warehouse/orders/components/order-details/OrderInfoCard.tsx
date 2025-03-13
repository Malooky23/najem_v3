'use client';

import { OrderType, MovementType, PackingType, DeliveryMethod } from "@/types/orders";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowUpRight, Box, Calendar, Package, RailSymbol, Truck, User, User2, UserCircle2 } from "lucide-react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";

interface OrderInfoCardProps {
  customerId: string;
  customerName: string;
  orderType: OrderType;
  movement: MovementType;
  packingType: PackingType;
  deliveryMethod: DeliveryMethod;
  orderMark?: string;
}

export function OrderInfoCard({
  customerId,
  customerName,
  orderType,
  movement,
  packingType,
  deliveryMethod,
  orderMark
}: OrderInfoCardProps) {
  // Helper function to format enum-like strings
  const formatLabel = (value: string) => {
    return value.split('_').map(word => 
      word.charAt(0) + word.slice(1).toLowerCase()
    ).join(' ');
  };

  return (
    <Card className="bg-white/70 shadow-md hover:shadow-lg transition-shadow mt-2">
      <CardHeader className="p-4">
        <CardTitle className="text-lg text-gray-700">Order Information</CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {/* Movement Type */}
          <div className="space-y-1">
            <label className="text-xs text-gray-500">Movement Type</label>
            <Badge variant="outline" className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <ArrowUpRight className="w-4 h-4 text-blue-500" />
              <span>{movement}</span>
            </Badge>
          </div>

          {/* Delivery Method */}
          <div className="space-y-1">
            <label className="text-xs text-gray-500">Delivery Method</label>
            {/* <div className="flex items-center gap-2 text-sm font-medium text-gray-700"> */}
            <Badge variant="outline" className="flex items-center gap-2 text-sm font-medium text-gray-700">

              <Truck className="w-4 h-4 text-green-500" />
              <span>{formatLabel(deliveryMethod)}</span>
            {/* </div> */}
            </Badge>

          </div>

          {/* Order Type */}
          {/* <div className="space-y-1">
            <label className="text-xs text-gray-500">Order Type</label>
            <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <Package className="w-4 h-4 text-purple-500" />
              <span>{formatLabel(orderType)}</span>
            </div>
          </div> */}

          {/* Packing Type */}
          <div className="space-y-1">
            <label className="text-xs text-gray-500">Packing Type</label>
            {/* <div className="flex items-center gap-2 text-sm font-medium text-gray-700"> */}
            <Badge variant="outline" className="flex items-center gap-2 text-sm font-medium text-gray-700">

              <Box className="w-4 h-4 text-orange-500" />
              <span>{formatLabel(packingType)}</span>
            {/* </div> */}
            </Badge>

          </div>

          {/* Customer */}
          <div className="space-y-1">
            <label className="text-xs text-gray-500">Customer</label>
            {/* <div className="flex items-center gap-2 text-sm font-medium text-gray-700"> */}
            <Badge variant="outline" className="flex items-center gap-2 text-sm font-medium text-gray-700">

              <UserCircle2 className="w-6 h-6 text-indigo-500" />
              <span className="truncate">{customerName}</span>
            {/* </div> */}
            </Badge>

          </div>
          <div className="space-y-1">
            <label className="text-xs text-gray-500">Order Mark</label>
            {/* <div className="flex items-center gap-2 text-sm font-medium text-gray-700"> */}
            <Badge variant="outline" className="flex items-center gap-2 text-sm font-medium text-gray-700">

              <RailSymbol className="w-4 h-4 text-indigo-500" />
              <span>{orderMark ?? "---"}</span>
            {/* </div> */}
            </Badge>

          </div>
        </div>
      </CardContent>
    </Card>
  );
}