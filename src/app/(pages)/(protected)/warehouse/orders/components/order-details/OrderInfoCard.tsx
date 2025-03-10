import { EnrichedOrders } from "@/types/orders";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
          import { formatInTimeZone, toDate } from "date-fns-tz"

interface OrderInfoCardProps {
  order: EnrichedOrders;
}

export function OrderInfoCard({ order }: OrderInfoCardProps) {
  return (
    <Card className="mt-4 bg-white/70 backdrop-blur-sm shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg">Order Information</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4 md:grid-cols-2">
        <div>
          <p className="text-sm font-medium text-gray-500">Customer</p>
          <p>{order.customerName || "N/A"}</p>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-500">Delivery Method</p>
          <p>{order.deliveryMethod || "N/A"}</p>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-500">Order Date</p>
          <p>
            {order.createdAt 
              ? formatInTimeZone(toDate(order.createdAt),"Asia/Dubai","EEE, dd-MM-yyyy")
              : "N/A"}
          </p>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-500">Movement Type</p>
          <p className="capitalize">{order.movement?.toLowerCase() || "N/A"}</p>
        </div>
        {/* Add any other order info fields you need */}
      </CardContent>
    </Card>
  );
}