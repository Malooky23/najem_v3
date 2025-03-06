import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

import { EnrichedOrders } from "@/types/orders"
import { format } from "date-fns"

interface OrderInfoCardProps {
  order: EnrichedOrders
}

export function OrderInfoCard({ order }: OrderInfoCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Order Information</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Date Created</p>
            <p>{format(order.createdAt, 'MMMM dd, yyyy')}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Customer</p>
            <p>{order.customerName || 'N/A'}</p>
          </div>
          {/* <div>
            <p className="text-sm font-medium text-muted-foreground">Warehouse</p>
            <p>{order. || 'N/A'}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Total</p>
            <p>{order.total?.toFixed(2) || '0.00'}</p>
          </div> */}
        </div>
      </CardContent>
    </Card>
  )
}