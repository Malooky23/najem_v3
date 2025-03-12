"use client"
import { memo } from "react"
import { useItemsStore } from "@/stores/items-store"
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { format } from "date-fns"
import { ItemSchemaType } from "@/types/items"
import {
  Package2,
  Barcode,
  Scale,
  Box,
  MapPin,
  User2,
  CalendarClock,
  StickyNote,
  Hash,
  Info,
  Ruler,
  ArrowDownUp,
  History,
  ArrowUp,
  ArrowDown,
  X
} from "lucide-react"
import { MovementType } from "@/types/stockMovement"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { is } from "drizzle-orm"
import { Drawer } from "@/components/ui/drawer"


interface DetailsPanelProps {
  isMobile: boolean;
  items: ItemSchemaType[];
}

export const DetailsPanel = memo<DetailsPanelProps>(function DetailsPanel({
  isMobile,
  items
}) {
  const store = useItemsStore()
  const selectedItem = items.find(item => item.itemId === store.selectedItemId)

  if (!selectedItem) {
    return (
      <div className="w-full h-full flex items-center justify-center text-muted-foreground">
        No item selected
      </div>
    )
  }

  // Get total current quantity across all locations
  const totalQuantity = selectedItem.itemStock?.reduce(
    (sum, stock) => sum + stock.currentQuantity,
    0
  ) ?? 0

  // Get latest movements, sorted by date
  const latestMovements = selectedItem.stockMovements
    ?.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    ?.slice(0, 5) ?? []

  if (isMobile) {
    return (
      <Drawer >

        {/* <ScrollArea className="h-[calc(100vh-8rem)]"> */}
          <div className="space-y-4 pr-4">
            {/* Main Info Card */}
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-2xl font-bold">
                      {selectedItem.itemName}
                    </CardTitle>
                    <CardDescription className="flex items-center mt-1">
                      <Hash className="h-4 w-4 mr-1" />
                      {selectedItem.itemNumber}
                    </CardDescription>
                  </div>
                  {selectedItem.itemType && (
                    <Badge variant="outline" className="capitalize text-sm">
                      {selectedItem.itemType}
                    </Badge>
                  )}
                  <Button variant="outline" className="p-2" onClick={() => store.closeDetails()}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  {selectedItem.itemBrand && (
                    <div className="flex items-center gap-2">
                      <Package2 className="h-4 w-4 text-blue-500 shrink-0" />
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{store.isDetailsOpen}</p>
                        <p className="text-xs text-muted-foreground">Brand</p>
                      </div>
                    </div>
                  )}

                  {selectedItem.itemModel && (
                    <div className="flex items-center gap-2">
                      <Box className="h-4 w-4 text-blue-500 shrink-0" />
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{selectedItem.itemModel}</p>
                        <p className="text-xs text-muted-foreground">Model</p>
                      </div>
                    </div>
                  )}

                  {selectedItem.itemBarcode && (
                    <div className="flex items-center gap-2">
                      <Barcode className="h-4 w-4 text-blue-500 shrink-0" />
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{selectedItem.itemBarcode}</p>
                        <p className="text-xs text-muted-foreground">Barcode</p>
                      </div>
                    </div>
                  )}

                  {selectedItem.itemCountryOfOrigin && (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-blue-500 shrink-0" />
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{selectedItem.itemCountryOfOrigin}</p>
                        <p className="text-xs text-muted-foreground">Origin</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Current Stock Card */}
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center">
                  <ArrowDownUp className="h-4 w-4 text-emerald-500 mr-2" />
                  <CardTitle className="text-sm">Current Stock</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Box className="h-4 w-4 text-emerald-500 shrink-0" />
                      <div>
                        <p className="text-sm font-medium">{totalQuantity}</p>
                        <p className="text-xs text-muted-foreground">Total Quantity</p>
                      </div>
                    </div>

                    {selectedItem.itemStock?.[0]?.lastUpdated && (
                      <div className="text-right">
                        <p className="text-sm">{format(selectedItem.itemStock[0].lastUpdated, 'dd/MM/yyyy')}</p>
                        <p className="text-xs text-muted-foreground">Last Updated</p>
                      </div>
                    )}
                  </div>

                  {selectedItem.itemStock?.map(stock => (
                    <div key={stock.locationId} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-emerald-500 shrink-0" />
                        <div>
                          <p className="text-sm font-medium">{stock.currentQuantity}</p>
                          <p className="text-xs text-muted-foreground">Location {stock.locationId}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent Movements Card */}
            {/* {latestMovements.length > 0 && ( */}
            {true && (
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex items-center">
                    <History className="h-4 w-4 text-purple-500 mr-2" />
                    <CardTitle className="text-sm">Recent Movements</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {latestMovements.map(movement => (
                      <div key={movement.movementId} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {movement.movementType === 'IN' ? (
                            <ArrowUp className="h-4 w-4 text-green-500 shrink-0" />
                          ) : (
                            <ArrowDown className="h-4 w-4 text-red-500 shrink-0" />
                          )}
                          <div>
                            <p className="text-sm font-medium">
                              {movement.movementType === 'IN' ? '+' : '-'}{movement.quantity}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              #{movement.movementNumber}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm">{format(movement.createdAt, 'dd/MM/yyyy')}</p>
                          <p className="text-xs text-muted-foreground">
                            Level: {movement.stockLevelAfter}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Specifications Card */}
            {(selectedItem.weightGrams || selectedItem.dimensions) && (
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex items-center">
                    <Ruler className="h-4 w-4 text-emerald-500 mr-2" />
                    <CardTitle className="text-sm">Specifications</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    {selectedItem.weightGrams && (
                      <div className="flex items-center gap-2">
                        <Scale className="h-4 w-4 text-emerald-500 shrink-0" />
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate">{selectedItem.weightGrams}g</p>
                          <p className="text-xs text-muted-foreground">Weight</p>
                        </div>
                      </div>
                    )}

                    {selectedItem.dimensions && (
                      <div className="flex items-center gap-2">
                        <Box className="h-4 w-4 text-emerald-500 shrink-0" />
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate">
                            {selectedItem.dimensions.width && `W: ${selectedItem.dimensions.width}cm`}
                            {selectedItem.dimensions.height && ` H: ${selectedItem.dimensions.height}cm`}
                            {selectedItem.dimensions.length && ` L: ${selectedItem.dimensions.length}cm`}
                          </p>
                          <p className="text-xs text-muted-foreground">Dimensions</p>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Customer Info Card */}
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center">
                  <Info className="h-4 w-4 text-purple-500 mr-2" />
                  <CardTitle className="text-sm">Additional Information</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <User2 className="h-4 w-4 text-purple-500 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{selectedItem.customerId}</p>
                      <p className="text-xs text-muted-foreground">Customer ID</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <CalendarClock className="h-4 w-4 text-purple-500 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">
                        {format(selectedItem.createdAt, 'dd/MM/yyyy')}
                      </p>
                      <p className="text-xs text-muted-foreground">Created</p>
                    </div>
                  </div>

                  {selectedItem.updatedAt && (
                    <div className="flex items-center gap-2">
                      <CalendarClock className="h-4 w-4 text-purple-500 shrink-0" />
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">
                          {format(selectedItem.updatedAt, 'dd/MM/yyyy')}
                        </p>
                        <p className="text-xs text-muted-foreground">Updated</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Notes Card */}
            {selectedItem.notes && (
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex items-center">
                    <StickyNote className="h-4 w-4 text-orange-500 mr-2" />
                    <CardTitle className="text-sm">Notes</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm break-words">{selectedItem.notes}</p>
                </CardContent>
              </Card>
            )}
          </div>
        {/* </ScrollArea> */}
      </Drawer>
    )
  }
  return (
    <div className={cn("flex-1 p-4 bg-white  rounded-lg border-2 border-slate-200",
      // isMobile ? 'w-full' : 'w-[60%]'
    )}>
      <ScrollArea className="h-[calc(100vh-8rem)]">
        <div className="space-y-4 pr-4">
          {/* Main Info Card */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-2xl font-bold">
                    {selectedItem.itemName}
                  </CardTitle>
                  <CardDescription className="flex items-center mt-1">
                    <Hash className="h-4 w-4 mr-1" />
                    {selectedItem.itemNumber}
                  </CardDescription>
                </div>
                {selectedItem.itemType && (
                  <Badge variant="outline" className="capitalize text-sm">
                    {selectedItem.itemType}
                  </Badge>
                )}
                <Button variant="outline" className="p-2" onClick={() => store.closeDetails()}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                {selectedItem.itemBrand && (
                  <div className="flex items-center gap-2">
                    <Package2 className="h-4 w-4 text-blue-500 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{store.isDetailsOpen}</p>
                      <p className="text-xs text-muted-foreground">Brand</p>
                    </div>
                  </div>
                )}

                {selectedItem.itemModel && (
                  <div className="flex items-center gap-2">
                    <Box className="h-4 w-4 text-blue-500 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{selectedItem.itemModel}</p>
                      <p className="text-xs text-muted-foreground">Model</p>
                    </div>
                  </div>
                )}

                {selectedItem.itemBarcode && (
                  <div className="flex items-center gap-2">
                    <Barcode className="h-4 w-4 text-blue-500 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{selectedItem.itemBarcode}</p>
                      <p className="text-xs text-muted-foreground">Barcode</p>
                    </div>
                  </div>
                )}

                {selectedItem.itemCountryOfOrigin && (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-blue-500 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{selectedItem.itemCountryOfOrigin}</p>
                      <p className="text-xs text-muted-foreground">Origin</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Current Stock Card */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center">
                <ArrowDownUp className="h-4 w-4 text-emerald-500 mr-2" />
                <CardTitle className="text-sm">Current Stock</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Box className="h-4 w-4 text-emerald-500 shrink-0" />
                    <div>
                      <p className="text-sm font-medium">{totalQuantity}</p>
                      <p className="text-xs text-muted-foreground">Total Quantity</p>
                    </div>
                  </div>

                  {selectedItem.itemStock?.[0]?.lastUpdated && (
                    <div className="text-right">
                      <p className="text-sm">{format(selectedItem.itemStock[0].lastUpdated, 'dd/MM/yyyy')}</p>
                      <p className="text-xs text-muted-foreground">Last Updated</p>
                    </div>
                  )}
                </div>

                {selectedItem.itemStock?.map(stock => (
                  <div key={stock.locationId} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-emerald-500 shrink-0" />
                      <div>
                        <p className="text-sm font-medium">{stock.currentQuantity}</p>
                        <p className="text-xs text-muted-foreground">Location {stock.locationId}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Movements Card */}
          {/* {latestMovements.length > 0 && ( */}
          {true && (
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center">
                  <History className="h-4 w-4 text-purple-500 mr-2" />
                  <CardTitle className="text-sm">Recent Movements</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {latestMovements.map(movement => (
                    <div key={movement.movementId} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {movement.movementType === 'IN' ? (
                          <ArrowUp className="h-4 w-4 text-green-500 shrink-0" />
                        ) : (
                          <ArrowDown className="h-4 w-4 text-red-500 shrink-0" />
                        )}
                        <div>
                          <p className="text-sm font-medium">
                            {movement.movementType === 'IN' ? '+' : '-'}{movement.quantity}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            #{movement.movementNumber}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm">{format(movement.createdAt, 'dd/MM/yyyy')}</p>
                        <p className="text-xs text-muted-foreground">
                          Level: {movement.stockLevelAfter}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Specifications Card */}
          {(selectedItem.weightGrams || selectedItem.dimensions) && (
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center">
                  <Ruler className="h-4 w-4 text-emerald-500 mr-2" />
                  <CardTitle className="text-sm">Specifications</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  {selectedItem.weightGrams && (
                    <div className="flex items-center gap-2">
                      <Scale className="h-4 w-4 text-emerald-500 shrink-0" />
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{selectedItem.weightGrams}g</p>
                        <p className="text-xs text-muted-foreground">Weight</p>
                      </div>
                    </div>
                  )}

                  {selectedItem.dimensions && (
                    <div className="flex items-center gap-2">
                      <Box className="h-4 w-4 text-emerald-500 shrink-0" />
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">
                          {selectedItem.dimensions.width && `W: ${selectedItem.dimensions.width}cm`}
                          {selectedItem.dimensions.height && ` H: ${selectedItem.dimensions.height}cm`}
                          {selectedItem.dimensions.length && ` L: ${selectedItem.dimensions.length}cm`}
                        </p>
                        <p className="text-xs text-muted-foreground">Dimensions</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Customer Info Card */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center">
                <Info className="h-4 w-4 text-purple-500 mr-2" />
                <CardTitle className="text-sm">Additional Information</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <User2 className="h-4 w-4 text-purple-500 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{selectedItem.customerId}</p>
                    <p className="text-xs text-muted-foreground">Customer ID</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <CalendarClock className="h-4 w-4 text-purple-500 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">
                      {format(selectedItem.createdAt, 'dd/MM/yyyy')}
                    </p>
                    <p className="text-xs text-muted-foreground">Created</p>
                  </div>
                </div>

                {selectedItem.updatedAt && (
                  <div className="flex items-center gap-2">
                    <CalendarClock className="h-4 w-4 text-purple-500 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">
                        {format(selectedItem.updatedAt, 'dd/MM/yyyy')}
                      </p>
                      <p className="text-xs text-muted-foreground">Updated</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Notes Card */}
          {selectedItem.notes && (
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center">
                  <StickyNote className="h-4 w-4 text-orange-500 mr-2" />
                  <CardTitle className="text-sm">Notes</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm break-words">{selectedItem.notes}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </ScrollArea>
    </div>
  )
})