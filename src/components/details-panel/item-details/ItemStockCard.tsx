'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ItemSchemaType } from "@/types/items";
import { format } from 'date-fns';
import { ArrowDownUp, Box, Building, History, ArrowUp, ArrowDown } from 'lucide-react';
import { FieldItem } from './FieldItem'; // Assuming FieldItem is moved here or imported globally
import { Separator } from "@/components/ui/separator";
import { EnrichedStockMovementView } from "@/types/stockMovement";

interface ItemStockCardProps {
  item: ItemSchemaType;
  isLoading: boolean;
}

export function ItemStockCard({ item, isLoading }: ItemStockCardProps) {
  const totalQuantity = item.itemStock?.reduce(
    (sum, stock) => sum + stock.currentQuantity,
    0
  ) ?? 0;

  const latestMovements = item.stockMovements
    ?.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    ?.slice(0, 5) ?? [];

  // if (isLoading) {
  //   // Basic skeleton
  //   return (
  //     <Card className="overflow-hidden border shadow-sm bg-white/70">
  //       <CardHeader className="bg-muted/30 p-4 border-b">
  //         <Skeleton className="h-5 w-1/2" />
  //       </CardHeader>
  //       <CardContent className="p-4 space-y-4">
  //         <Skeleton className="h-10 w-full" />
  //         <Separator />
  //         <Skeleton className="h-20 w-full" />
  //       </CardContent>
  //     </Card>
  //   );
  // }

  return (
    <Card className="overflow-hidden border shadow-sm bg-white/70">
      <CardHeader className="bg-muted/30 p-4 border-b">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <ArrowDownUp className="h-4 w-4 text-green-600" />
          Inventory & History
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 space-y-4">
        {/* Current Stock Section */}
        <div>
          {/* Replicate layout from old DetailsPanel or OrderDetails version */}
          <h3 className="text-md font-medium mb-3 flex items-center gap-2 text-slate-900">
            <Box className="h-4 w-4" />
            Total Stock: {totalQuantity}
          </h3>


          <div className="space-y-3">
          <Separator />
          <div className="pt-2 flex">
            <h3 className="text-md font-medium mb-3 flex items-center gap-2 text-slate-900">
              <Building className="h-4 w-4" />
              Stock Locations
            </h3>
          </div>
            {item.itemStock && item.itemStock.length > 0 && (
              <div className="space-y-2 pl-7 border-l-2 border-dotted ml-[7px]">
                {item.itemStock.map((stock, index) => (
                  <div key={stock.locationId} className="flex justify-between items-center text-sm">
                    <div className="flex items-center gap-2">
                      {/* <Building className="h-3.5 w-3.5 text-muted-foreground" /> */}
                      <span>{index+1}: Default</span>
                    </div>
                    <span className="font-medium">{stock.currentQuantity} units</span>
                  </div>
                ))}
              </div>
            )}

            {/* Last Updated */}
            {item.itemStock?.[ 0 ]?.lastUpdated && (
              <div className="text-xs text-muted-foreground text-right pt-1">
                Last Stock Update: {format(new Date(item.itemStock[ 0 ].lastUpdated), 'PPp')}
              </div>
            )}
          </div>
        </div>

        {/* Recent Movements Section */}

        <>
          <Separator />
          <div>
            <h3 className="text-sm font-medium mb-3 flex items-center gap-2 text-muted-foreground">
              <History className="h-4 w-4" />
              Recent Movements (Last 5)
            </h3>
            <div className="space-y-3">
              {isLoading ? (
                <Skeleton className="w-full h-12" />
              ) : latestMovements.length > 0 ? (
                latestMovements.map(movement => (
                  <div key={movement.movementId} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      {movement.movementType === 'IN' ? (
                        <ArrowUp className="h-4 w-4 text-green-500 shrink-0" />
                      ) : (
                        <ArrowDown className="h-4 w-4 text-red-500 shrink-0" />
                      )}
                      <div>
                        <p className="font-medium">
                          {movement.movementType === 'IN' ? '+' : '-'}{movement.quantity}
                          <span className="text-xs text-muted-foreground ml-1">units</span>
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {movement.movementNumber ? `#${movement.movementNumber}` : 'Adj.'}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p>{format(new Date(movement.createdAt), 'dd/MM/yy')}</p>
                      <p className="text-xs text-muted-foreground">
                        Level: {movement.stockLevelAfter}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p> No Movements</p>
              )}
            </div>
          </div>
        </>

      </CardContent>
    </Card>
  );
}

const MovementsTable = (latestMovements: EnrichedStockMovementView[]) => {
  return (
    latestMovements.map(movement => (
      <div key={movement.movementId} className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-2">
          {movement.movementType === 'IN' ? (
            <ArrowUp className="h-4 w-4 text-green-500 shrink-0" />
          ) : (
            <ArrowDown className="h-4 w-4 text-red-500 shrink-0" />
          )}
          <div>
            <p className="font-medium">
              {movement.movementType === 'IN' ? '+' : '-'}{movement.quantity}
              <span className="text-xs text-muted-foreground ml-1">units</span>
            </p>
            <p className="text-xs text-muted-foreground">
              {movement.movementNumber ? `#${movement.movementNumber}` : 'Adj.'}
            </p>
          </div>
        </div>
        <div className="text-right">
          <p>{format(new Date(movement.createdAt), 'dd/MM/yy')}</p>
          <p className="text-xs text-muted-foreground">
            Level: {movement.stockLevelAfter}
          </p>
        </div>
      </div>
    ))

  )
}