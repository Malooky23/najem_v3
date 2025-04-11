'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { NotebookPen } from "lucide-react";

interface OrderNotesCardProps {
  notes: string;
  orderId: string;
  isLoading: boolean;
}

export function OrderNotesCard({ notes, orderId, isLoading }: OrderNotesCardProps) {

  if (isLoading) {
    return (
      <Card className="mt-6 bg-white/70 shadow-md hover:shadow-lg transition-shadow">
        {/* <CardHeader className="p-4">
          <CardTitle className="text-lg text-gray-700">Order Items</CardTitle>
        </CardHeader> */}
        <CardContent className="p-2">
          <Skeleton className="h-12" />
        </CardContent>
      </Card>
    );
  }

  if (!notes ){
    return(
      <Card className="mt-6 bg-white/70 shadow-md hover:shadow-lg transition-shadow">
        <CardHeader className="p-2">
          <CardTitle className="text-sm text-gray-500 text-center flex justify-center items-center">
            <NotebookPen size={30} className="pr-2"/>
            <p>No notes available</p>
            </CardTitle>
        </CardHeader>
      </Card>
    )
  }
  return (
    <Card className="mt-6 bg-white/70 shadow-md hover:shadow-lg transition-shadow">
      <CardHeader className="p-4">
        <CardTitle className="text-lg text-gray-700">Notes</CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <p className="text-sm text-gray-600 text-wrap break-words">
          {notes || "No notes available."}
        </p>
      </CardContent>
    </Card>
  );
}