import { EnrichedOrders } from "@/types/orders";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useState, useEffect } from "react";

interface OrderNotesCardProps {
  order: EnrichedOrders;
  isEditing: boolean;
  updateOrderNotes: (newNotes: string) => void;
}

export function OrderNotesCard({ order, isEditing, updateOrderNotes }: OrderNotesCardProps) {
  // Local state for notes content
  const [notes, setNotes] = useState(order.notes || "");

  // Update local state when order changes
  useEffect(() => {
    setNotes(order.notes || "");
  }, [order]);

  // Handle notes change
  const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newNotes = e.target.value;
    setNotes(newNotes);
    updateOrderNotes(newNotes);
  };

  return (
    <Card className="mt-4 bg-white/70 backdrop-blur-sm shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg font-bold">Notes</CardTitle>
      </CardHeader>
      <CardContent>
        {isEditing ? (
          <Textarea 
            value={notes} 
            onChange={handleNotesChange} 
            placeholder="Add notes about this order..."
          />
        ) : (
          <p className="whitespace-pre-wrap text-gray-700">
            {notes || "No notes available."}
          </p>
        )}
      </CardContent>
    </Card>
  );
}