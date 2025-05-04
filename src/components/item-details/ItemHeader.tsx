'use client';

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit, Package2, X } from "lucide-react";
import { ItemSchemaType } from "@/types/items";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
// Potentially import EditItemForm Dialog trigger if needed

interface ItemHeaderProps {
  item: ItemSchemaType;
  handleClose: () => void;
  isLoading: boolean;
}

export function ItemHeader({ item, handleClose, isLoading }: ItemHeaderProps) {
  if (isLoading) {
    return (
      <div className="flex justify-between items-center w-full">
        <div className="flex gap-2 items-center">
          <Skeleton className="h-6 w-6 rounded-full" />
          <Skeleton className="h-5 w-32" />
        </div>
        <Skeleton className="h-8 w-8 rounded-md" />
      </div>
    );
  }

  return (
    <div className="flex justify-between items-center w-full gap-4">
      <div className="flex gap-3 items-center min-w-0">
        {/* <Package2 className="h-5 w-5 text-primary shrink-0" /> */}
        {item.itemType && (
          <Badge
          variant={item.itemType as any} // Assuming variant matches type
          className="capitalize text-xs px-2 py-0.5 whitespace-nowrap shrink-0"
          >
            {item.itemType}
          </Badge>
        )}
        <h2 className="text-lg font-semibold truncate">{item.itemName}</h2>
      </div>
      <div className="flex gap-2 shrink-0">
        {/* Add Edit Button Trigger here if needed */}
        {/* <EditItemDialogTrigger item={item}>
              <Button variant="outline" size="icon" className="h-8 w-8">
                  <Edit className="h-4 w-4" />
              </Button>
          </EditItemDialogTrigger> */}
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleClose}>
          <X className="h-4 w-4" />
          <span className="sr-only">Close Details</span>
        </Button>
      </div>
    </div>
  );
}