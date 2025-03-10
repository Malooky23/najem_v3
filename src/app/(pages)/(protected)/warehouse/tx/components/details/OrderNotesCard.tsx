import { EnrichedOrders } from "@/types/orders"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface OrderNotesCardProps {
  order: EnrichedOrders
}

export function OrderNotesCard({ order }: OrderNotesCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Notes</CardTitle>
      </CardHeader>
      <CardContent>
        {order.notes ? (
          <p className="whitespace-pre-wrap">{order.notes}</p>
        ) : (
          <p className="text-muted-foreground italic">No notes for this order</p>
        )}
      </CardContent>
    </Card>
  )
}