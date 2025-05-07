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
        <Badge
          variant="outline"
          className="h-7 px-3 text-lg font-bold border-2 border-black bg-white rounded-full"
        >
          <p className="whitespace-nowrap">Item #{item.itemNumber}</p>
        </Badge>
        {item.itemType && (
          <span
            className={`h-7 rounded-full items-center flex justify-center font-bold w-28 text-center ${item.itemType}`}
          >
            {item.itemType}
          </span>
          
        )}
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