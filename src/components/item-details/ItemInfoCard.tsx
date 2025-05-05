'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ItemSchemaType } from "@/types/items";
import { format } from 'date-fns';
import { Package2, Box, Barcode, MapPin, User2, CalendarClock, Info } from 'lucide-react';
import { FieldItem } from './FieldItem'; // Assuming FieldItem is moved here or imported globally
import { Separator } from "../ui/separator";

interface ItemInfoCardProps {
  item: ItemSchemaType;
  isLoading: boolean;
}

export function ItemInfoCard({ item, isLoading }: ItemInfoCardProps) {
  if (isLoading) {
    // Basic skeleton for the card
    return (
      <Card className="overflow-hidden border shadow-sm bg-white/70">
        <CardHeader className="bg-muted/30 p-4 border-b">
          <Skeleton className="h-5 w-3/4" />
        </CardHeader>
        <CardContent className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden border shadow-sm bg-white/70">
      <CardHeader className="bg-muted/30 p-4 border-b">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <Info className="h-4 w-4 text-blue-600" />
          Item Information
        </CardTitle>
      </CardHeader>
      {/* <CardContent className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4"> */}
      <CardContent className="p-4">
        {/* <FieldItem
          icon={User2}
          label="Item Name"
          value={item.itemName}
          iconClassName="text-blue-600"
          // className="mb-4" // Add some bottom margin to separate it from the grid
        /> */}

        {/* <div className="">
          <p>Item Name</p>
          <p>{item.itemName}</p>
        </div> */}

        <div className="flex items-start gap-3 pb-2">
          <div className="min-w-0 flex-1">
            <p className="text-xs text-muted-foreground">Item Name</p>
            <p className="text-sm font-medium text-justify">{item.itemName}</p>
          </div>
        </div>
        <Separator className=""/>

        <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">

          {/* Transfer relevant FieldItems from old DetailsPanel */}
          <FieldItem icon={User2} label="Customer" value={item.customerDisplayName} iconClassName="text-purple-600" />
          <FieldItem icon={Package2} label="Brand" value={item.itemBrand} iconClassName="text-blue-600" />
          <FieldItem icon={Box} label="Model" value={item.itemModel} iconClassName="text-blue-600" />
          <FieldItem icon={Barcode} label="Barcode" value={item.itemBarcode} iconClassName="text-blue-600" />
          <FieldItem icon={MapPin} label="Country of Origin" value={item.itemCountryOfOrigin} iconClassName="text-blue-600" />
          <FieldItem icon={CalendarClock} label="Created On" value={format(new Date(item.createdAt), 'dd MMM yyyy')} iconClassName="text-purple-600" />
          {item.updatedAt && (
            <FieldItem icon={CalendarClock} label="Last Updated" value={format(new Date(item.updatedAt), 'dd MMM yyyy')} iconClassName="text-purple-600" />
          )}
        </div>
      </CardContent>
    </Card>
  );
}