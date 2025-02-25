import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { UseFormReturn } from "react-hook-form"
import { EnrichedOrders } from "@/types/orders"

interface OrderNotesCardProps {
  order: EnrichedOrders
  form: UseFormReturn<EnrichedOrders>
  isEditing: boolean
}

export function OrderNotesCard({ order, form, isEditing }: OrderNotesCardProps) {
  return (
    <Card className="mt-6 bg-white/70 shadow-md hover:shadow-lg transition-shadow">
      <CardHeader className="p-4">
        <CardTitle className="text-lg text-gray-700">Notes</CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        {isEditing ? (
          <Textarea
            value={form.watch("notes") ?? ""}
            onChange={(e) => form.setValue("notes", e.target.value)}
            placeholder="Add notes here..."
          />
        ) : (
          <p className="text-sm text-gray-600">{order.notes || "No notes available."}</p>
        )}
      </CardContent>
    </Card>
  )
}