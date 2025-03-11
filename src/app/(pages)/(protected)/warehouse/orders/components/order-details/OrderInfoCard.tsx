'use client';

import { OrderType, MovementType, PackingType, DeliveryMethod } from "@/types/orders";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatInTimeZone, toDate } from "date-fns-tz";
import { Calendar, User, Truck, Package } from "lucide-react";

interface OrderInfoCardProps {
  customerId: string;
  customerName: string;
  orderType: OrderType;
  movement: MovementType;
  packingType: PackingType;
  deliveryMethod: DeliveryMethod;
}

export function OrderInfoCard({
  customerId,
  customerName,
  orderType,
  movement,
  packingType,
  deliveryMethod
}: OrderInfoCardProps) {
  return (
    <Card className="mt-4 bg-white/70 backdrop-blur-sm shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg font-bold">Order Information</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4 md:grid-cols-2">
        <div>
          <p className="text-sm font-medium text-gray-500 flex items-center gap-1">
            <User className="w-4 h-4 inline-block mr-1" /> Customer
          </p>
          <p>{customerName || "N/A"}</p>
        </div>
        
        <div>
          <p className="text-sm font-medium text-gray-500 flex items-center gap-1">
            <Truck className="w-4 h-4 inline-block mr-1" /> Delivery Method
          </p>
          <p>{deliveryMethod || "N/A"}</p>
        </div>
        
        <div>
          <p className="text-sm font-medium text-gray-500 flex items-center gap-1">
            <Package className="w-4 h-4 inline-block mr-1" /> Movement Type
          </p>
          <p>{movement || "N/A"}</p>
        </div>
        
        <div>
          <p className="text-sm font-medium text-gray-500 flex items-center gap-1">
            Order Type
          </p>
          <p>{orderType || "N/A"}</p>
        </div>
        
        <div>
          <p className="text-sm font-medium text-gray-500 flex items-center gap-1">
            Packing Type
          </p>
          <p>{packingType || "N/A"}</p>
        </div>
      </CardContent>
    </Card>
  );
}