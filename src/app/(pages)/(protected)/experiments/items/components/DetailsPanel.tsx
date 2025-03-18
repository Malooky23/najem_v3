"use client"
import { memo, useState, useEffect } from "react"
import { useItemsStore } from "@/stores/items-store"
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { format } from "date-fns"
import { ITEM_TYPES, ItemSchemaType } from "@/types/items"
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
  X,
  ChevronDown
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
  DrawerClose
} from "@/components/ui/drawer"
import { useMediaQuery } from "@/hooks/use-media-query"

interface DetailsPanelProps {
  items: ItemSchemaType[];
}

export const DetailsPanel = memo<DetailsPanelProps>(function DetailsPanel({
  items
}) {
  const store = useItemsStore()
  const isMobile = useMediaQuery("(max-width: 800px)")
  // Local drawer state for smooth animations
  const [isDrawerOpen, setIsDrawerOpen] = useState(store.isDetailsOpen)
  const selectedItem = items.find(item => item.itemId === store.selectedItemId)

  // Sync store state to local state when opening
  useEffect(() => {
    if (store.isDetailsOpen) {
      setIsDrawerOpen(true)
    }
  }, [store.isDetailsOpen])

  // Handle controlled drawer closing
  const handleDrawerOpenChange = (open: boolean) => {
    if (!open) {
      // First set local state for animation
      setIsDrawerOpen(false)
      // Then update store after animation completes
      setTimeout(() => {
        store.closeDetails()
      }, 500) // Slightly longer than animation duration to ensure completion
    }
  }

  if (!selectedItem) {
    return

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

  // Content for both mobile and desktop views
  const detailsContent = (
    <div className="space-y-4">
      {/* Main Info Card */}
      <Card className="border-none shadow-none">
        <CardHeader className="pb-2 ">
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
              <Badge variant={selectedItem.itemType as "CARTON" | "BOX" | "SACK" | "EQUIPMENT" | "PALLET" | "CAR" | "OTHER"} className="capitalize text-sm">
                {selectedItem.itemType}
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="">
          <div className="grid grid-cols-2 gap-4">
            {selectedItem.itemBrand && (
              <div className="flex items-center gap-2">
                <Package2 className="h-4 w-4 text-blue-500 shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{selectedItem.itemBrand}</p>
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

      {/* Customer Info Card */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center">
            <Info className="h-4 w-4 text-purple-500 mr-2" />
            <CardTitle className="text-sm">Customer Information</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <User2 className="h-4 w-4 text-purple-500 shrink-0" />
              <div className="min-w-0">
                <p className="text-sm font-medium truncate">{selectedItem.customerDisplayName}</p>
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

            {/* {selectedItem.itemStock?.map(stock => (
              <div key={stock.locationId} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-emerald-500 shrink-0" />
                  <div>
                    <p className="text-sm font-medium">{stock.currentQuantity}</p>
                    <p className="text-xs text-muted-foreground">Location {stock.locationId}</p>
                  </div>
                </div>
              </div>
            ))} */}
          </div>
        </CardContent>
      </Card>

      {/* Recent Movements Card */}
      {latestMovements.length > 0 && (
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
  )

  if (isMobile) {
    return (
      <Drawer
        modal={true}
        open={isDrawerOpen}
        onOpenChange={handleDrawerOpenChange}
      >
        <DrawerContent className="max-h-[85vh]">
          <DrawerHeader className="border-b  ">
            <div className="flex items-center justify-between">
              <DrawerTitle className="flex items-center gap-2 text-lg">
                <Package2 className="h-5 w-5 text-primary" />
                {selectedItem.itemName}
                <DrawerDescription>
                  {selectedItem.itemNumber} • {selectedItem.itemType}
                </DrawerDescription>
              </DrawerTitle>
              <DrawerClose asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                  <X className="h-4 w-4" />
                </Button>
              </DrawerClose>
            </div>

          </DrawerHeader>

          {/* <ScrollArea className="flex-1 px-4 py-2"> */}

          <div
            className="h-full overflow-y-auto p-4 pb-0 mobile-form-container"
          >
            {detailsContent}

          </div>

          {/* </ScrollArea> */}

          <DrawerFooter className="border-t pt-2 px-4">
            <div className="flex justify-between">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDrawerOpenChange(false)}
              >
                Close
              </Button>
              <Button size="sm" className="bg-primary hover:bg-primary/90">
                Edit Item
              </Button>
            </div>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    )
  }

  if (!isMobile) {
    return (
      <div className="flex-1 p-4 w-full bg-gradient-to-tr from-pink-200/50 to-blue-200/50  backdrop-blur-lg ">
        {/* <div className="flex items-center justify-between  mr-4">
          <div className="">
            <Badge variant={selectedItem.itemType as "CARTON" | "BOX" | "SACK" | "EQUIPMENT" | "PALLET" | "CAR" | "OTHER"} className=" text-sm border-slate-200 border">
              {selectedItem.itemType}
            </Badge>
          </div>
          <div className="">
            <Button variant="ghost" className=" " onClick={() => store.closeDetails()}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div> */}
        <Button variant="ghost" className="" onClick={() => store.closeDetails()}>
          <X className="h-4 w-4" />
        </Button>
        <ScrollArea className="h-[calc(100vh-8rem)]">
          <div className="pr-4">
            {detailsContent}
          </div>
        </ScrollArea>
      </div>
    )

  }
})