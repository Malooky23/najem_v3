"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ChevronRight } from "lucide-react"
import { ItemSchemaType } from "@/types/items"

interface MobileItemCardProps {
  item: ItemSchemaType
  onClick: () => void
}

export function MobileItemCard({ item, onClick }: MobileItemCardProps) {
  const stockData = item.itemStock as ItemSchemaType["itemStock"];
  const stockLevel = stockData ? stockData.reduce((acc, curr) => acc + curr.currentQuantity, 0) : 0;
  const stockStatus = stockLevel === 0 ? "out-of-stock" : stockLevel < 20 ? "low-stock" : "in-stock";

  return (
    <Card
      className="my-3 overflow-hidden border-l-4 transition-all active:scale-98"
      style={{
        borderLeftColor:
          stockStatus === "out-of-stock"
            ? "var(--destructive)"
            : stockStatus === "low-stock"
              ? "var(--warning)"
              : "var(--success)",
      }}
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-medium">{item.itemName}</h3>
            <p className="text-sm text-muted-foreground">#{item.itemNumber}</p>
          </div>
          <Badge
            className="ml-auto"
            variant={item.itemType === "CARTON"
                  ? "CARTON"
                  : item.itemType === "BOX"
                    ? "BOX"
                    : item.itemType === "SACK"
                      ? "SACK"
                      : item.itemType === "EQUIPMENT"
                        ? "EQUIPMENT"
                        : item.itemType === "PALLET"
                          ? "PALLET"
                          : item.itemType === "CAR"
                            ? "CAR"
                            : "default"
              }
            // color={
            //   item.itemType === "CARTON"
            //     ? "blue"
            //     : item.itemType === "BOX"
            //       ? "green"
            //       : item.itemType === "SACK"
            //         ? "purple"
            //         : item.itemType === "EQUIPMENT"
            //           ? "orange"
            //           : item.itemType === "PALLET"
            //             ? "yellow"
            //             : item.itemType === "CAR"
            //               ? "amber"
            //               : "default"
            // }
          >
            {item.itemType}
          </Badge>
        </div>
        <div className="mt-2 text-sm">
          <span className="text-muted-foreground">Customer:</span> {item.customerDisplayName}
        </div>
        <div className="mt-3 flex justify-between items-center">
          <div>
            <p className="text-sm font-medium">Stock</p>
            <div className="flex items-center">
              {stockStatus === "out-of-stock" ? (
                <Badge variant="destructive" className="mt-1">
                  Out of stock
                </Badge>
              ) : (
                <p
                  className={`text-lg font-semibold ${
                    stockStatus === "low-stock" ? "text-amber-500" : "text-green-600"
                  }`}
                >
                  {stockLevel}
                </p>
              )}
            </div>
          </div>
          <Button variant="ghost" size="icon" className="rounded-full">
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

