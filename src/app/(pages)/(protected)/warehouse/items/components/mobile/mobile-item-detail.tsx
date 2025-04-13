import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ItemSchemaType } from "@/types/items";

interface MobileItemDetailProps {
  item: ItemSchemaType
}

export function MobileItemDetail({ item }: MobileItemDetailProps) {
  const stockData = item.itemStock as ItemSchemaType["itemStock"];
  const stockLevel = stockData ? stockData.reduce((acc, curr) => acc + curr.currentQuantity, 0) : 0;
  const stockStatus = stockLevel === 0 ? "out-of-stock" : stockLevel < 20 ? "low-stock" : "in-stock";

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">{item.itemName}</h2>
        <div className="flex items-center gap-2">
          <Badge
            color={
              item.itemType === "CARTON"
                ? "blue"
                : item.itemType === "BOX"
                  ? "green"
                  : item.itemType === "SACK"
                    ? "purple"
                    : item.itemType === "EQUIPMENT"
                      ? "orange"
                      : item.itemType === "PALLET"
                        ? "yellow"
                        : item.itemType === "CAR"
                          ? "amber"
                          : "default"
            }
            className="px-2 py-1"
          >
            {item.itemType}
          </Badge>
          <span className="text-muted-foreground">#{item.itemNumber}</span>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Customer</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-lg font-medium">{item.customerDisplayName}</p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Stock Level</CardTitle>
          </CardHeader>
          <CardContent>
            {stockStatus === "out-of-stock" ? (
              <Badge variant="destructive">Out of stock</Badge>
            ) : (
              <p className={`text-2xl font-bold ${stockStatus === "low-stock" ? "text-amber-500" : "text-green-600"}`}>
                {stockLevel}
              </p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Last Updated</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-medium">{item.updatedAt ? item.updatedAt.toLocaleDateString(): "Not Available"}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Stock Locations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {item.itemStock && item.itemStock.map((stock) => (
              <div key={stock.locationId} className="flex justify-between items-center border-b pb-2">
                <span>Location {stock.locationId.replace("loc-", "")}</span>
                <span className="font-medium">{stock.currentQuantity} units</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-2">
        <Button className="flex-1">Edit Item</Button>
        <Button variant="outline" className="flex-1">
          Move Stock
        </Button>
      </div>
    </div>
  )
}

