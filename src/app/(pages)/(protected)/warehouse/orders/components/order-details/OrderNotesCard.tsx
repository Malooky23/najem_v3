import { EnrichedOrders } from "@/types/orders";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface OrderNotesCardProps {
  order: EnrichedOrders;
}

export function OrderNotesCard({ order }: OrderNotesCardProps) {
  if (!order.notes) return null;

  return (
    <Card className="mt-4 bg-white/70 backdrop-blur-sm shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg">Notes</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="whitespace-pre-wrap text-gray-700">{order.notes}</p>
      </CardContent>
    </Card>
  );
}