"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ChevronRight } from "lucide-react"
import { ItemSchemaType } from "@/types/items"
import { EnrichedCustomer } from "@/types/customer"

interface MobileItemCardProps {
  item: EnrichedCustomer
  onClick: () => void
}

export function MobileItemCard({ item, onClick }: MobileItemCardProps) {
  const customerType = item.customerType

  return (
    <Card
      className="my-3 overflow-hidden border-l-4 transition-all active:scale-98"
      style={{
        borderLeftColor:
          customerType === "INDIVIDUAL"
            ? "var(--destructive)"
              : "var(--success)",
      }}
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-medium">{item.displayName}</h3>
            <p className="text-sm text-muted-foreground">#{item.customerNumber}</p>
          </div>
          <Badge
            className="ml-auto"
            variant={item.customerType === "INDIVIDUAL"
              ? "EQUIPMENT"
              : "BOX"
              }
          >
            {item.customerType}
          </Badge>
        </div>
        <div className="mt-2 text-sm">
          <span className="text-muted-foreground">Customer:</span> {item.displayName}
        </div>
        <div className="mt-3 flex justify-between items-center">
          <Button variant="ghost" size="icon" className="rounded-full">
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

