'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface OrderNotesCardProps {
  notes: string;
  orderId: string;
}

export function OrderNotesCard({ notes, orderId }: OrderNotesCardProps) {
  return (
    <Card className="mt-6 bg-white/70 shadow-md hover:shadow-lg transition-shadow">
      <CardHeader className="p-4">
        <CardTitle className="text-lg text-gray-700">Notes</CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <p className="text-sm text-gray-600 whitespace-pre-wrap">
          {notes || "No notes available."}
        </p>
      </CardContent>
    </Card>
  );
}