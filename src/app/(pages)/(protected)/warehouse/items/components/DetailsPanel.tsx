// "use client"
// import { memo, useState, useEffect } from "react"
// import { useItemsStore } from "@/stores/items-store"
// import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card"
// import { Badge } from "@/components/ui/badge"
// import { ScrollArea } from "@/components/ui/scroll-area"
// import { format } from "date-fns"
// import { ItemSchemaType } from "@/types/items"
// import {
//   Package2,
//   Barcode,
//   Scale,
//   Box,
//   MapPin,
//   User2,
//   CalendarClock,
//   StickyNote,
//   Hash,
//   Info,
//   Ruler,
//   ArrowDownUp,
//   History,
//   ArrowUp,
//   ArrowDown,
//   X,
//   ChevronDown
// } from "lucide-react"
// import { Button } from "@/components/ui/button"
// import { cn } from "@/lib/utils"
// import {
//   Drawer,
//   DrawerContent,
//   DrawerHeader,
//   DrawerTitle,
//   DrawerDescription,
//   DrawerFooter,
//   DrawerClose
// } from "@/components/ui/drawer"
// import { useMediaQuery } from "@/hooks/use-media-query"
// import { Label } from "@/components/ui/label"
// import { Switch } from "@/components/ui/switch"

// interface DetailsPanelProps {
//   items: ItemSchemaType[];
// }

// export const DetailsPanel = memo<DetailsPanelProps>(function DetailsPanel({
//   items
// }) {
//   const store = useItemsStore()
//   const isMobile = useMediaQuery("(max-width: 800px)")
//   // Local drawer state for smooth animations
//   const [ isDrawerOpen, setIsDrawerOpen ] = useState(store.isDetailsOpen)
//   const selectedItem = items.find(item => item.itemId === store.selectedItemId)
//   const [ dimensionUnit, setDimensionUnit ] = useState<'cm' | 'm'>('cm'); // Default to cm

//   // Sync store state to local state when opening
//   useEffect(() => {
//     if (store.isDetailsOpen) {
//       setIsDrawerOpen(true)
//     }
//   }, [ store.isDetailsOpen ])

//   // Handle controlled drawer closing
//   const handleDrawerOpenChange = (open: boolean) => {
//     if (!open) {
//       // First set local state for animation
//       setIsDrawerOpen(false)
//       // Then update store after animation completes
//       setTimeout(() => {
//         store.closeDetails()
//       }, 500) // Slightly longer than animation duration to ensure completion
//     }
//   }

//   if (!selectedItem) {
//     return

//   }

//   // Get total current quantity across all locations
//   const totalQuantity = selectedItem.itemStock?.reduce(
//     (sum, stock) => sum + stock.currentQuantity,
//     0
//   ) ?? 0

//   // Get latest movements, sorted by date
//   const latestMovements = selectedItem.stockMovements
//     ?.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
//     ?.slice(0, 5) ?? []

//   // Content for both mobile and desktop views
//   const detailsContent = (
//     <div className="space-y-4">
//       {/* Main Info Card */}
//       <Card className="border-none shadow-none">
//         <CardHeader className="pb-2 ">
//           <div className="flex items-start justify-between">
//             <div>
//               <CardTitle className="text-2xl font-bold">
//                 {selectedItem.itemName}
//               </CardTitle>
//               <CardDescription className="flex items-center mt-1">
//                 <Hash className="h-4 w-4 mr-1" />
//                 {selectedItem.itemNumber}
//               </CardDescription>
//             </div>
//             {selectedItem.itemType && (
//               <Badge variant={selectedItem.itemType as "CARTON" | "BOX" | "SACK" | "EQUIPMENT" | "PALLET" | "CAR" | "OTHER"} className="capitalize text-sm">
//                 {selectedItem.itemType}
//               </Badge>
//             )}
//           </div>
//         </CardHeader>
//         <CardContent className="">
//           <div className="grid grid-cols-2 gap-4">
//             {selectedItem.itemBrand && (
//               <div className="flex items-center gap-2">
//                 <Package2 className="h-4 w-4 text-blue-500 shrink-0" />
//                 <div className="min-w-0">
//                   <p className="text-sm font-medium truncate">{selectedItem.itemBrand}</p>
//                   <p className="text-xs text-muted-foreground">Brand</p>
//                 </div>
//               </div>
//             )}

//             {selectedItem.itemModel && (
//               <div className="flex items-center gap-2">
//                 <Box className="h-4 w-4 text-blue-500 shrink-0" />
//                 <div className="min-w-0">
//                   <p className="text-sm font-medium truncate">{selectedItem.itemModel}</p>
//                   <p className="text-xs text-muted-foreground">Model</p>
//                 </div>
//               </div>
//             )}

//             {selectedItem.itemBarcode && (
//               <div className="flex items-center gap-2">
//                 <Barcode className="h-4 w-4 text-blue-500 shrink-0" />
//                 <div className="min-w-0">
//                   <p className="text-sm font-medium truncate">{selectedItem.itemBarcode}</p>
//                   <p className="text-xs text-muted-foreground">Barcode</p>
//                 </div>
//               </div>
//             )}

//             {selectedItem.itemCountryOfOrigin && (
//               <div className="flex items-center gap-2">
//                 <MapPin className="h-4 w-4 text-blue-500 shrink-0" />
//                 <div className="min-w-0">
//                   <p className="text-sm font-medium truncate">{selectedItem.itemCountryOfOrigin}</p>
//                   <p className="text-xs text-muted-foreground">Origin</p>
//                 </div>
//               </div>
//             )}
//           </div>
//         </CardContent>
//       </Card>

//       {/* Customer Info Card */}
//       <Card>
//         <CardHeader className="pb-2">
//           <div className="flex items-center">
//             <Info className="h-4 w-4 text-purple-500 mr-2" />
//             <CardTitle className="text-sm">Customer Information</CardTitle>
//           </div>
//         </CardHeader>
//         <CardContent>
//           <div className="grid grid-cols-2 gap-4">
//             <div className="flex items-center gap-2">
//               <User2 className="h-4 w-4 text-purple-500 shrink-0" />
//               <div className="min-w-0">
//                 <p className="text-sm font-medium truncate">{selectedItem.customerDisplayName}</p>
//                 <p className="text-xs text-muted-foreground">Customer ID</p>
//               </div>
//             </div>

//             <div className="flex items-center gap-2">
//               <CalendarClock className="h-4 w-4 text-purple-500 shrink-0" />
//               <div className="min-w-0">
//                 <p className="text-sm font-medium truncate">
//                   {format(selectedItem.createdAt, 'dd/MM/yyyy')}
//                 </p>
//                 <p className="text-xs text-muted-foreground">Created</p>
//               </div>
//             </div>

//             {selectedItem.updatedAt && (
//               <div className="flex items-center gap-2">
//                 <CalendarClock className="h-4 w-4 text-purple-500 shrink-0" />
//                 <div className="min-w-0">
//                   <p className="text-sm font-medium truncate">
//                     {format(selectedItem.updatedAt, 'dd/MM/yyyy')}
//                   </p>
//                   <p className="text-xs text-muted-foreground">Updated</p>
//                 </div>
//               </div>
//             )}
//           </div>
//         </CardContent>
//       </Card>

//       {/* Current Stock Card */}
//       <Card>
//         <CardHeader className="pb-2">
//           <div className="flex items-center">
//             <ArrowDownUp className="h-4 w-4 text-emerald-500 mr-2" />
//             <CardTitle className="text-sm">Current Stock</CardTitle>
//           </div>
//         </CardHeader>
//         <CardContent>
//           <div className="space-y-4">
//             <div className="flex items-center justify-between">
//               <div className="flex items-center gap-2">
//                 <Box className="h-4 w-4 text-emerald-500 shrink-0" />
//                 <div>
//                   <p className="text-sm font-medium">{totalQuantity}</p>
//                   <p className="text-xs text-muted-foreground">Total Quantity</p>
//                 </div>
//               </div>

//               {selectedItem.itemStock?.[ 0 ]?.lastUpdated && (
//                 <div className="text-right">
//                   <p className="text-sm">{format(selectedItem.itemStock[ 0 ].lastUpdated, 'dd/MM/yyyy')}</p>
//                   <p className="text-xs text-muted-foreground">Last Updated</p>
//                 </div>
//               )}
//             </div>

//             {/* {selectedItem.itemStock?.map(stock => (
//               <div key={stock.locationId} className="flex items-center justify-between">
//                 <div className="flex items-center gap-2">
//                   <MapPin className="h-4 w-4 text-emerald-500 shrink-0" />
//                   <div>
//                     <p className="text-sm font-medium">{stock.currentQuantity}</p>
//                     <p className="text-xs text-muted-foreground">Location {stock.locationId}</p>
//                   </div>
//                 </div>
//               </div>
//             ))} */}
//           </div>
//         </CardContent>
//       </Card>

//       {/* Recent Movements Card */}
//       {latestMovements.length > 0 && (
//         <Card>
//           <CardHeader className="pb-2">
//             <div className="flex items-center">
//               <History className="h-4 w-4 text-purple-500 mr-2" />
//               <CardTitle className="text-sm">Recent Movements</CardTitle>
//             </div>
//           </CardHeader>
//           <CardContent>
//             <div className="space-y-3">
//               {latestMovements.map(movement => (
//                 <div key={movement.movementId} className="flex items-center justify-between">
//                   <div className="flex items-center gap-2">
//                     {movement.movementType === 'IN' ? (
//                       <ArrowUp className="h-4 w-4 text-green-500 shrink-0" />
//                     ) : (
//                       <ArrowDown className="h-4 w-4 text-red-500 shrink-0" />
//                     )}
//                     <div>
//                       <p className="text-sm font-medium">
//                         {movement.movementType === 'IN' ? '+' : '-'}{movement.quantity}
//                       </p>
//                       <p className="text-xs text-muted-foreground">
//                         #{movement.movementNumber}
//                       </p>
//                     </div>
//                   </div>
//                   <div className="text-right">
//                     <p className="text-sm">{format(movement.createdAt, 'dd/MM/yyyy')}</p>
//                     <p className="text-xs text-muted-foreground">
//                       Level: {movement.stockLevelAfter}
//                     </p>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </CardContent>
//         </Card>
//       )}

//       {/* Specifications Card */}
//       {(selectedItem.weightGrams || selectedItem.dimensions) && (
//         <Card>
//           <CardHeader className="pb-2">
//             <div className="flex items-center justify-between">
//               {/* Title */}
//               <div className="flex items-center">
//                 <Ruler className="h-4 w-4 text-emerald-500 mr-2" />
//                 <CardTitle className="text-sm">Specifications</CardTitle>
//               </div>
//               {/* Dimension Unit Toggle */}
//               {selectedItem.dimensions && (
//                 <div className="flex items-center space-x-2">
//                   <Label htmlFor="dimension-unit-display" className="text-xs">
//                     cm
//                   </Label>
//                   <Switch
//                     id="dimension-unit-display"
//                     checked={dimensionUnit === 'm'}
//                     onCheckedChange={(checked) => setDimensionUnit(checked ? 'm' : 'cm')}
//                     className="h-4 w-7 data-[state=checked]:bg-emerald-500 data-[state=unchecked]:bg-gray-300"
//                   // thumbClassName="h-3 w-3 data-[state=checked]:translate-x-3.5 data-[state=unchecked]:translate-x-0.5"
//                   />
//                   <Label htmlFor="dimension-unit-display" className="text-xs">
//                     m
//                   </Label>
//                 </div>
//               )}
//             </div>
//           </CardHeader>
//           <CardContent>
//             <div className="space-y-4">
//               {/* Weight Section */}
//               <div>
//                 <div className="flex items-center gap-2">
//                   <Scale className="h-4 w-4 text-emerald-500 shrink-0" />
//                   <div className="min-w-0">
//                     <p className="text-sm font-medium truncate">
//                       {selectedItem.weightGrams && selectedItem.weightGrams > 0
//                         ? (selectedItem.weightGrams >= 1000
//                           ? `${(selectedItem.weightGrams / 1000).toFixed(2)} kg`
//                           : `${selectedItem.weightGrams} g`)
//                         : "-"}
//                     </p>
//                     <p className="text-xs text-muted-foreground">Weight</p>
//                   </div>
//                 </div>

//               </div>

//               {/* Dimensions Section - Only show if dimensions object exists */}

//               {selectedItem.dimensions && (
//                 // <div className="grid grid-cols-3 gap-3 pt-2">
//                 //   {/* Width */}
//                 //   <div className="flex flex-col items-center bg-emerald-50 p-2 rounded">
//                 //     <p className="text-xs text-muted-foreground">Width</p>
//                 //     <p className="text-sm font-medium">{formatDimension(selectedItem.dimensions.width, dimensionUnit)}</p>
//                 //   </div>
//                 //   {/* Height */}
//                 //   <div className="flex flex-col items-center bg-emerald-50 p-2 rounded">
//                 //     <p className="text-xs text-muted-foreground">Height</p>
//                 //     <p className="text-sm font-medium">{formatDimension(selectedItem.dimensions.height, dimensionUnit)}</p>
//                 //   </div>
//                 //   {/* Length */}
//                 //   <div className="flex flex-col items-center bg-emerald-50 p-2 rounded">
//                 //     <p className="text-xs text-muted-foreground">Length</p>
//                 //     <p className="text-sm font-medium">{formatDimension(selectedItem.dimensions.length, dimensionUnit)}</p>
//                 <div className="space-y-2">
//                   <p className="text-xs text-muted-foreground font-medium">Dimensions ({dimensionUnit})</p>
//                   <div className="grid grid-cols-3 gap-3">
//                     {/* Using a helper component or repeating structure */}
//                     <DimensionItem label="Width" value={formatDimension(selectedItem.dimensions.width, dimensionUnit)} />
//                     <DimensionItem label="Height" value={formatDimension(selectedItem.dimensions.height, dimensionUnit)} />
//                     <DimensionItem label="Length" value={formatDimension(selectedItem.dimensions.length, dimensionUnit)} />

//                   </div>
//                 </div>
//               )}
//             </div>
//           </CardContent>
//         </Card>
//       )}



//       {/* Notes Card */}
//       {selectedItem.notes && (
//         <Card>
//           <CardHeader className="pb-2">
//             <div className="flex items-center">
//               <StickyNote className="h-4 w-4 text-orange-500 mr-2" />
//               <CardTitle className="text-sm">Notes</CardTitle>
//             </div>
//           </CardHeader>
//           <CardContent>
//             <p className="text-sm break-words">{selectedItem.notes}</p>
//           </CardContent>
//         </Card>
//       )}
//     </div>
//   )

//   if (isMobile) {
//     return (
//       <Drawer
//         modal={true}
//         open={isDrawerOpen}
//         onOpenChange={handleDrawerOpenChange}
//       >
//         <DrawerContent className="max-h-[85vh]">
//           <DrawerHeader className="border-b  ">
//             <div className="flex items-center justify-between">
//               <DrawerTitle className="flex items-center gap-2 text-lg">
//                 <Package2 className="h-5 w-5 text-primary" />
//                 {selectedItem.itemName}
//                 <DrawerDescription>
//                   {selectedItem.itemNumber} • {selectedItem.itemType}
//                 </DrawerDescription>
//               </DrawerTitle>
//               <DrawerClose asChild>
//                 <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
//                   <X className="h-4 w-4" />
//                 </Button>
//               </DrawerClose>
//             </div>

//           </DrawerHeader>

//           {/* <ScrollArea className="flex-1 px-4 py-2"> */}

//           <div
//             className="h-full overflow-y-auto p-4 pb-0 mobile-form-container"
//           >
//             {detailsContent}

//           </div>

//           {/* </ScrollArea> */}

//           <DrawerFooter className="border-t pt-2 px-4">
//             <div className="flex justify-between">
//               <Button
//                 variant="outline"
//                 size="sm"
//                 onClick={() => handleDrawerOpenChange(false)}
//               >
//                 Close
//               </Button>
//               <Button size="sm" className="bg-primary hover:bg-primary/90">
//                 Edit Item
//               </Button>
//             </div>
//           </DrawerFooter>
//         </DrawerContent>
//       </Drawer>
//     )
//   }


//   if (!isMobile) {
//     return (
//       <div className="flex-1 p-4 w-full bg-gradient-to-tr from-pink-200/50 to-blue-200/50  backdrop-blur-lg ">
//         {/* <div className="flex items-center justify-between  mr-4">
//           <div className="">
//             <Badge variant={selectedItem.itemType as "CARTON" | "BOX" | "SACK" | "EQUIPMENT" | "PALLET" | "CAR" | "OTHER"} className=" text-sm border-slate-200 border">
//               {selectedItem.itemType}
//             </Badge>
//           </div>
//           <div className="">
//             <Button variant="ghost" className=" " onClick={() => store.closeDetails()}>
//               <X className="h-4 w-4" />
//             </Button>
//           </div>
//         </div> */}
//         <Button variant="ghost" className="" onClick={() => store.closeDetails()}>
//           <X className="h-4 w-4" />
//         </Button>
//         <ScrollArea className="h-[calc(100vh-8rem)]">
//           <div className="pr-4">
//             {detailsContent}
//           </div>
//         </ScrollArea>
//       </div>
//     )

//   }
// })

// // Helper component for dimension items
// const DimensionItem = ({ label, value }: { label: string; value: string }) => (
//   <div className="flex flex-col items-center justify-center bg-emerald-50/50 dark:bg-emerald-900/20 p-2 rounded-md text-center h-16">
//     <p className="text-xs text-muted-foreground">{label}</p>
//     <p className="text-sm font-medium mt-1">{value}</p>
//   </div>
// );

// const formatDimension = (valueInMm: number | null | undefined, unit: 'cm' | 'm'): string => {
//   if (valueInMm === null || valueInMm === undefined || valueInMm === 0) return "-";

//   let value: number;
//   let formattedValue: string;

//   if (unit === 'm') {
//     value = valueInMm / 1000;
//     // Format to max 3 decimal places, remove trailing zeros if only .000
//     formattedValue = value.toFixed(3).replace(/\.?0+$/, '');
//     // If it ends up as just an integer after removing zeros, ensure it's displayed as such
//     if (formattedValue.endsWith('.')) {
//       formattedValue = formattedValue.slice(0, -1);
//     }
//     return `${formattedValue} m`;
//   } else { // unit === 'cm'
//     value = valueInMm / 10;
//     // Format to max 1 decimal place, remove trailing .0
//     formattedValue = value.toFixed(1).replace(/\.0$/, '');
//     return `${formattedValue} cm`;
//   }
// };

"use client"
import { memo, useState, useEffect } from "react"
import { useItemsStore } from "@/stores/items-store"
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { format } from "date-fns"
import { ItemSchemaType } from "@/types/items"
import {
  Package2, // Brand / General Item
  Barcode, // Barcode
  Scale, // Weight
  Box, // Model / Quantity / Type
  MapPin, // Origin / Location
  User2, // Customer
  CalendarClock, // Date
  StickyNote, // Notes
  Hash, // Item Number
  Info, // Details section
  Ruler, // Dimensions section
  ArrowDownUp, // Stock / Inventory section
  History, // Movements section
  ArrowUp, // Stock In
  ArrowDown, // Stock Out
  X, // Close
  ChevronRight, // Could use for more details link if needed
  Weight, // Alternative for Weight if Scale is confusing
  Building // Location ID/Name
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
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator" // Import Separator

interface DetailsPanelProps {
  items: ItemSchemaType[];
}

// --- Helper Component for consistent field display ---
interface FieldItemProps {
  icon: React.ElementType;
  label: string;
  value: React.ReactNode;
  iconClassName?: string;
  valueClassName?: string;
  containerClassName?: string;
}

const FieldItem: React.FC<FieldItemProps> = ({
  icon: Icon,
  label,
  value,
  iconClassName = "text-muted-foreground", // Default neutral color
  valueClassName = "text-sm font-medium truncate",
  containerClassName = "flex items-center gap-3" // Increased gap
}) => (
  <div className={containerClassName}>
    <Icon className={cn("h-4 w-4 shrink-0", iconClassName)} aria-hidden="true" />
    <div className="min-w-0 flex-1">
      <p className={valueClassName}>{value || "-"}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  </div>
);
// --- End Helper Component ---

export const DetailsPanel = memo<DetailsPanelProps>(function DetailsPanel({
  items
}) {
  const store = useItemsStore()
  const isMobile = useMediaQuery("(max-width: 800px)")
  const [ isDrawerOpen, setIsDrawerOpen ] = useState(store.isDetailsOpen)
  const selectedItem = items.find(item => item.itemId === store.selectedItemId)
  const [ dimensionUnit, setDimensionUnit ] = useState<'cm' | 'm'>('cm');

  useEffect(() => {
    if (store.isDetailsOpen) {
      setIsDrawerOpen(true)
    }
  }, [ store.isDetailsOpen ])

  const handleDrawerOpenChange = (open: boolean) => {
    if (!open) {
      setIsDrawerOpen(false)
      setTimeout(() => {
        store.closeDetails()
      }, 300) // Match drawer animation duration
    }
  }

  if (!selectedItem) {
    return null; // Return null or a placeholder if no item is selected
  }

  const totalQuantity = selectedItem.itemStock?.reduce(
    (sum, stock) => sum + stock.currentQuantity,
    0
  ) ?? 0

  const latestMovements = selectedItem.stockMovements
    ?.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    ?.slice(0, 5) ?? []

  // --- Main Content Definition ---
  const detailsContent = (
    <div className="space-y-5">
      {/* --- Card 1: Primary Item Information --- */}
      <Card className="overflow-hidden border shadow-sm">
        <CardHeader className="bg-muted/30 p-4 border-b">
          <div className="flex items-start justify-between gap-3">
            <div>
              <CardTitle className="text-xl font-semibold flex items-center gap-2">
                <Package2 className="h-5 w-5 text-primary" />
                {selectedItem.itemName}
              </CardTitle>
              <CardDescription className="flex items-center mt-1 text-sm">
                <Hash className="h-3.5 w-3.5 mr-1" />
                {selectedItem.itemNumber}
              </CardDescription>
            </div>
            {selectedItem.itemType && (
              <Badge
                variant={selectedItem.itemType as any} // Assuming variant matches type
                className="capitalize text-xs px-2 py-0.5 mt-1 whitespace-nowrap"
              >
                <Box className="h-3 w-3 mr-1" />
                {selectedItem.itemType}
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
          <FieldItem icon={Package2} label="Brand" value={selectedItem.itemBrand} iconClassName="text-blue-600" />
          <FieldItem icon={Box} label="Model" value={selectedItem.itemModel} iconClassName="text-blue-600" />
          <FieldItem icon={Barcode} label="Barcode" value={selectedItem.itemBarcode} iconClassName="text-blue-600" />
          <FieldItem icon={MapPin} label="Country of Origin" value={selectedItem.itemCountryOfOrigin} iconClassName="text-blue-600" />
        </CardContent>
      </Card>

      {/* --- Card 2: Inventory & Stock Movements --- */}
      <Card className="overflow-hidden border shadow-sm">
        <CardHeader className="bg-muted/30 p-4 border-b">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <ArrowDownUp className="h-4 w-4 text-green-600" />
            Inventory & History
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 space-y-4">
          {/* Current Stock Section */}
          <div>
            <h3 className="text-sm font-medium mb-3 flex items-center gap-2 text-muted-foreground">
              <Box className="h-4 w-4" />
              Current Stock Levels
            </h3>
            <div className="space-y-3">
              <FieldItem
                icon={Box}
                label="Total Quantity"
                value={totalQuantity}
                iconClassName="text-green-600"
                valueClassName="text-lg font-bold"
                containerClassName="items-center gap-3 mb-3" // Center vertically
              />
              {/* Location Breakdown */}
              {selectedItem.itemStock && selectedItem.itemStock.length > 0 && (
                <div className="space-y-2 pl-7 border-l-2 border-dotted ml-[7px] "> {/* Indent location details */}
                  {selectedItem.itemStock.map(stock => (
                    <div key={stock.locationId} className="flex justify-between items-center text-sm">
                      <div className="flex items-center gap-2">
                        <Building className="h-3.5 w-3.5 text-muted-foreground" />
                        {/* <span>Location: {stock.locationId}</span> */}
                        <span>Location: {`<configure location name>`}</span>
                      </div>
                      <span className="font-medium">{stock.currentQuantity} units</span>
                    </div>
                  ))}
                </div>
              )}
              {/* Last Updated */}
              {selectedItem.itemStock?.[ 0 ]?.lastUpdated && (
                <div className="text-xs text-muted-foreground text-right pt-1">
                  Last Update: {format(selectedItem.itemStock[ 0 ].lastUpdated, 'PPp')}
                </div>
              )}
            </div>
          </div>

          {/* Recent Movements Section */}
          {latestMovements.length > 0 && (
            <>
              <Separator /> {/* Visual separation */}
              <div>
                <h3 className="text-sm font-medium mb-3 flex items-center gap-2 text-muted-foreground">
                  <History className="h-4 w-4" />
                  Recent Movements (Last 5)
                </h3>
                <div className="space-y-3">
                  {latestMovements.map(movement => (
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
                            {movement.movementNumber ? `#${movement.movementNumber}` : 'Manual Adj.'}
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
                  ))}
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* --- Card 3: Specifications --- */}
      {(selectedItem.weightGrams || selectedItem.dimensions) && (
        <Card className="overflow-hidden border shadow-sm">
          <CardHeader className="bg-muted/30 p-4 border-b">
            <div className="flex items-center justify-between gap-4">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Ruler className="h-4 w-4 text-purple-600" />
                Specifications
              </CardTitle>
              {selectedItem.dimensions && (
                <div className="flex items-center space-x-2">
                  <Label htmlFor="dimension-unit-display" className="text-xs text-muted-foreground">cm</Label>
                  <Switch
                    id="dimension-unit-display"
                    checked={dimensionUnit === 'm'}
                    onCheckedChange={(checked) => setDimensionUnit(checked ? 'm' : 'cm')}
                    className="h-4 w-7 data-[state=checked]:bg-purple-600 data-[state=unchecked]:bg-gray-300"
                  />
                  <Label htmlFor="dimension-unit-display" className="text-xs text-muted-foreground">m</Label>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent className="p-4 space-y-4">
            {/* Weight */}
            {selectedItem.weightGrams !== undefined && selectedItem.weightGrams !== null && (
              <FieldItem
                icon={Scale} // Or use Weight icon
                label="Weight"
                value={
                  selectedItem.weightGrams > 0
                    ? (selectedItem.weightGrams >= 1000
                      ? `${(selectedItem.weightGrams / 1000).toFixed(2)} kg`
                      : `${selectedItem.weightGrams} g`)
                    : "-"
                }
                iconClassName="text-purple-600"
              />
            )}

            {/* Dimensions */}
            {selectedItem.dimensions && (selectedItem.weightGrams !== undefined && selectedItem.weightGrams !== null) && <Separator className="my-3" /> /* Separator if both exist */}

            {selectedItem.dimensions && (
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-2">Dimensions ({dimensionUnit})</p>
                <div className="grid grid-cols-3 gap-3">
                  <DimensionItem label="Width" value={formatDimension(selectedItem.dimensions.width, dimensionUnit)} />
                  <DimensionItem label="Height" value={formatDimension(selectedItem.dimensions.height, dimensionUnit)} />
                  <DimensionItem label="Length" value={formatDimension(selectedItem.dimensions.length, dimensionUnit)} />
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* --- Card 4: Additional Details & Notes --- */}
      <Card className="overflow-hidden border shadow-sm">
        <CardHeader className="bg-muted/30 p-4 border-b">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Info className="h-4 w-4 text-orange-600" />
            Other Details
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 space-y-4">
          {/* Customer Info & Dates */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
            <FieldItem icon={User2} label="Customer" value={selectedItem.customerDisplayName} iconClassName="text-orange-600" />
            <FieldItem icon={CalendarClock} label="Created On" value={format(new Date(selectedItem.createdAt), 'dd MMM yyyy')} iconClassName="text-orange-600" />
            {selectedItem.updatedAt && (
              <FieldItem icon={CalendarClock} label="Last Updated" value={format(new Date(selectedItem.updatedAt), 'dd MMM yyyy')} iconClassName="text-orange-600" />
            )}
          </div>

          {/* Notes */}
          {selectedItem.notes && (
            <>
              <Separator />
              <div>
                <h3 className="text-sm font-medium mb-2 flex items-center gap-2 text-muted-foreground">
                  <StickyNote className="h-4 w-4" />
                  Notes
                </h3>
                <p className="text-sm break-words bg-amber-50/50 dark:bg-amber-900/20 p-3 rounded-md border border-amber-100 dark:border-amber-900/30">{selectedItem.notes}</p>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )

  // --- Mobile Drawer ---
  if (isMobile) {
    return (
      <Drawer
        modal={true}
        open={isDrawerOpen}
        onOpenChange={handleDrawerOpenChange}
      >
        <DrawerContent className="max-h-[90vh]"> {/* Increased max height slightly */}
          <DrawerHeader className="p-4 border-b">
            <div className="flex items-center justify-between gap-4">
              <div className="flex-1 min-w-0">
                <DrawerTitle className="text-lg font-semibold truncate">
                  {selectedItem.itemName}
                </DrawerTitle>
                <DrawerDescription className="text-xs">
                  {selectedItem.itemNumber}
                  {selectedItem.itemType && ` • ${selectedItem.itemType}`}
                </DrawerDescription>
              </div>
              <DrawerClose asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full flex-shrink-0">
                  <X className="h-4 w-4" />
                  <span className="sr-only">Close</span>
                </Button>
              </DrawerClose>
            </div>
          </DrawerHeader>

          {/* Use ScrollArea directly inside DrawerContent */}
          <ScrollArea className="flex-1 overflow-y-auto">
            <div className="p-4">
              {detailsContent}
            </div>
          </ScrollArea>

          <DrawerFooter className="p-4 border-t">
            <div className="flex justify-between gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDrawerOpenChange(false)}
              >
                Close
              </Button>
              {/* Add Edit Functionality if needed */}
              {/* <Button size="sm" className="bg-primary hover:bg-primary/90">
                                Edit Item
                            </Button> */}
            </div>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    )
  }

    
  // --- Desktop Panel ---
  return (
    // <div className={cn(
    //   "hidden md:flex flex-col border-l bg-card transition-all duration-300 ease-in-out",
    //   store.isDetailsOpen ? "w-96 p-4" : "w-0 p-0 overflow-hidden", // Adjust width and padding for animation
    // )}>
    <div className="flex-col h-full flex-1 pb-0 p-4 w-full bg-gradient-to-tr from-pink-200/50 to-blue-200/50  backdrop-blur-lg ">
      <>
        {/* Apply padding to this inner container */}
        <div className="flex flex-col h-full  px-2">
          <div className="flex items-center justify-between mb-2 flex-shrink-0"> {/* Header should not shrink */}
            <h2 className="text-lg font-semibold">Item Details</h2>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => store.closeDetails()}>
              <X className="h-4 w-4" />
              <span className="sr-only">Close Details</span>
            </Button>
          </div>
          {/* ScrollArea should grow to fill remaining space */}
          <ScrollArea className="flex-1  bg-green-500"> {/* Keep flex-1, remove negative margin if padding applied differently */}
            <div className="px-3 bg-red-400 pb-4"> {/* Add padding back inside ScrollArea */}
              {detailsContent}
            </div>
          </ScrollArea>
          {/* Optional Footer for Actions */}
          {/* <div className="border-t mt-4 pt-4 flex justify-end flex-shrink-0"> {/* Footer should not shrink */}
          {/*    <Button size="sm">Edit Item</Button> */}
          {/*</div> */}
        </div>
      </>

    </div>
  )
})

// Helper component for dimension items (slightly restyled)
const DimensionItem = ({ label, value }: { label: string; value: string }) => (
  <div className="flex flex-col items-center justify-center bg-muted/50 dark:bg-muted/20 p-2.5 rounded-md text-center h-16 border">
    <p className="text-xs text-muted-foreground font-medium">{label}</p>
    <p className="text-sm font-semibold mt-1">{value}</p>
  </div>
);

// Dimension formatting function (no changes needed)
const formatDimension = (valueInMm: number | null | undefined, unit: 'cm' | 'm'): string => {
  if (valueInMm === null || valueInMm === undefined || valueInMm === 0) return "-";

  let value: number;
  let formattedValue: string;

  if (unit === 'm') {
    value = valueInMm / 1000;
    formattedValue = value.toFixed(3).replace(/\.?0+$/, '');
    if (formattedValue.endsWith('.')) {
      formattedValue = formattedValue.slice(0, -1);
    }
    // Ensure very small numbers are still shown correctly
    if (Number(formattedValue) === 0 && value !== 0) {
      formattedValue = value.toFixed(3);
    }
    return `${formattedValue || '0'} m`;
  } else { // unit === 'cm'
    value = valueInMm / 10;
    formattedValue = value.toFixed(1).replace(/\.0$/, '');
    // Ensure very small numbers are still shown correctly
    if (Number(formattedValue) === 0 && value !== 0) {
      formattedValue = value.toFixed(1);
    }
    return `${formattedValue || '0'} cm`;
  }
};