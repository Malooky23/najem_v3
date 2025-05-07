'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ItemSchemaType } from "@/types/items";
import { StickyNote } from 'lucide-react';
import { CollapsibleNotes } from '@/components/details-panel/order-details/OrderInfoCard'; // Reuse or move CollapsibleNotes

interface ItemNotesCardProps {
  item: ItemSchemaType;
  isLoading: boolean;
}

export function ItemNotesCard({ item, isLoading }: ItemNotesCardProps) {

  if (isLoading) {
    return (
      <Card className="overflow-hidden border shadow-sm bg-white/70">
        <CardHeader className="bg-muted/30 p-4 border-b">
          <Skeleton className="h-5 w-1/4" />
        </CardHeader>
        <CardContent className="p-4">
          <Skeleton className="h-10 w-full" />
        </CardContent>
      </Card>
    )
  }

  // Don't render if no notes
  if (!item.notes) {
    return null;
  }

  return (
    <Card className="overflow-hidden border shadow-sm bg-white/70">
      <CardHeader className="bg-muted/30 p-4 border-b">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <StickyNote className="h-4 w-4 text-orange-600" />
          Notes
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        {/* Use CollapsibleNotes if needed */}
        {item.notes && item.notes.length > 100 ? ( // Adjust length threshold
          <CollapsibleNotes text={item.notes} />
        ) : (
          <p className="text-sm text-gray-600 text-wrap break-words">
            {item.notes || "No notes available."}
          </p>
        )}
      </CardContent>
    </Card>
  );
}