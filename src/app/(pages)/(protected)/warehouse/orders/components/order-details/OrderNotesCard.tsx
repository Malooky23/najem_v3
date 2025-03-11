'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface OrderNotesCardProps {
  notes: string;
  orderId: string;
}

export function OrderNotesCard({ notes, orderId }: OrderNotesCardProps) {
  return (
    <Card className="mt-4 bg-white/70 backdrop-blur-sm shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg font-bold">Notes</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="whitespace-pre-wrap text-gray-700">
          {notes || "No notes available."}
        </p>
      </CardContent>
    </Card>
  );
}