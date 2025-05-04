// import type { ColumnDef, FilterFn } from "@tanstack/react-table"
// import { Badge } from "@/components/ui/badge"
// import { cn } from "@/lib/utils"
// import type { ItemSchemaType } from "@/types/items"
// import { ItemStock } from "@/server/db/schema"
// import { Button } from "@/components/ui/button"
// import { RefreshCcw } from "lucide-react"

// // / Custom filter functions with proper implementation
// const arrayIncludesFilter: FilterFn<ItemSchemaType> = (row, columnId, filterValue) => {
//   // Return true for empty filters
//   if (!filterValue || !Array.isArray(filterValue) || filterValue.length === 0) return true

//   // Get the value from the row
//   const value = row.getValue(columnId)

//   // Return true if ANY of the filter values exactly match the cell value
//   return filterValue.includes(value)
// }

// const stringContainsFilter: FilterFn<ItemSchemaType> = (row, columnId, filterValue) => {
//   // Return true for empty filters
//   if (filterValue === undefined || filterValue === '') return true

//   // Get the value and convert to lowercase string
//   const value = String(row.getValue(columnId)).toLowerCase()

//   // Check if value contains the filterValue
//   return value.includes(String(filterValue).toLowerCase())
// }

// const stockLevelFilter: FilterFn<ItemSchemaType> = (row, columnId, filterValue) => {
//   // Return true for empty filters
//   if (!filterValue) return true

//   // Get the stock data
//   const stockData = row.getValue("itemStock") as ItemSchemaType[ "itemStock" ];

//   // Calculate total stock level
//   const stockLevel = stockData ? stockData.reduce((acc, curr) => acc + curr.currentQuantity, 0) : 0;

//   // Apply specific filter logic based on filterValue
//   if (filterValue === "out-of-stock") {
//     return stockLevel === 0
//   } else if (filterValue === "low-stock") {
//     return stockLevel > 0 && stockLevel < 20
//   }

//   return true
// }

// export const itemColumns: ColumnDef<ItemSchemaType>[] = [
//   {
//     accessorKey: "itemNumber",
//     header: "Item #",
//     // header: () => <div className="bg-green-200 px-1 flex flex-shrink text-center">Item ID</div>,

//     cell: ({ row }) => {
//       const itemNumber = row.getValue("itemNumber") as string
//       // return `#${itemNumber}`
//       return <span className="flex max-w-3 bg-red-50  text-gray-800 font-semibold">#{itemNumber}</span>
//       // return <span className="flex px-1 w-fit bg-red-100 text-gray-800 font-semibold">#{itemNumber}</span>
//     },
//     enableSorting: true,
//     filterFn: stringContainsFilter, // Use stringContains for partial matches
//     size: 10

//   },
//   {
//     accessorKey: "itemType",
//     header: () => <div className="text-center">Type</div>,
//     cell: ({ row }) => {
//       const type = row.getValue("itemType") as string | null
//       return type ? <TypeCell type={type} /> : null
//     },
//     enableSorting: true,
//     filterFn: arrayIncludesFilter, // Use arrayIncludes for exact matches
//     // size: 10
//   },
//   {
//     accessorKey: "itemName",
//     header: "Item Name",
//     cell: ({ row }) => {
//       const type = row.getValue("itemType") as string | null
//       return <span className="flex-nowrap  text-ellipsis max-w-80   min-w-80 ">{row.original.itemName}</span>
//     },
//     enableSorting: true,
//     filterFn: stringContainsFilter, // Use stringContains for partial matches
//     // size:300
//   },
//   {
//     accessorKey: "customerDisplayName",
//     header: "Customer",
//     cell: ({ row }) => {
//       const customer = row.getValue("customerDisplayName") as string
//       return <span className="max-w-40">{customer}</span>
//       // return <span className="font-medium">{customer}</span>
//     },
//     enableSorting: true,
//     filterFn: arrayIncludesFilter, // Use arrayIncludes for exact matches
//   },
//   {
//     accessorKey: "itemStock",
//     header: () => <div className="text-center">Total Stock</div>,
//     cell: ({ row }) => {
//       const stockData = row.getValue("itemStock") as ItemSchemaType[ "itemStock" ];
//       const stockLevel = stockData ? stockData.reduce((acc, curr) => acc + curr.currentQuantity, 0) : 0;
//       // if (stockLevel === 0) {
//       //   return (
//       //     <Badge className="flex mx-auto justify-center max-w-[100px] rounded-none" variant="secondary">
//       //       Out of stock
//       //     </Badge>
//       //   )
//       // }
//       return <p className="flex mx-auto justify-center max-w-[100px] text-center">{stockLevel.toString()}</p>
//     },
//     enableSorting: false,
//     filterFn: stockLevelFilter, // Use custom stockLevel filter
//     size: 10

//   },

// ]



// export const TypeCell = ({ type }: { type: string }) => {
//   // This fixed width (w-24) and inline-block are key
//   const baseStyles = "w-24 px-2 py-1 rounded-full text-xs font-semibold text-center inline-block whitespace-nowrap"

//   return (
//     // The span IS the badge with fixed width
//     <span className={cn(type, baseStyles)}>{type}</span>
//   )
// }

// src/app/(pages)/(protected)/warehouse/items/components/columns.tsx
import type { ColumnDef, FilterFn } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { ItemSchemaType } from "@/types/items"
import { Button } from "@/components/ui/button"
import { RefreshCcw } from "lucide-react"

// / Custom filter functions with proper implementation
const arrayIncludesFilter: FilterFn<ItemSchemaType> = (row, columnId, filterValue) => {
  // Return true for empty filters
  if (!filterValue || !Array.isArray(filterValue) || filterValue.length === 0) return true

  // Get the value from the row
  const value = row.getValue(columnId)

  // Return true if ANY of the filter values exactly match the cell value
  return filterValue.includes(value)
}

const stringContainsFilter: FilterFn<ItemSchemaType> = (row, columnId, filterValue) => {
  // Return true for empty filters
  if (filterValue === undefined || filterValue === '') return true

  // Get the value and convert to lowercase string
  const value = String(row.getValue(columnId)).toLowerCase()

  // Check if value contains the filterValue
  return value.includes(String(filterValue).toLowerCase())
}

const stockLevelFilter: FilterFn<ItemSchemaType> = (row, columnId, filterValue) => {
  // Return true for empty filters
  if (!filterValue) return true

  // Get the stock data
  const stockData = row.getValue("itemStock") as ItemSchemaType[ "itemStock" ];

  // Calculate total stock level
  const stockLevel = stockData ? stockData.reduce((acc, curr) => acc + curr.currentQuantity, 0) : 0;

  // Apply specific filter logic based on filterValue
  if (filterValue === "out-of-stock") {
    return stockLevel === 0
  } else if (filterValue === "low-stock") {
    return stockLevel > 0 && stockLevel < 20
  }

  return true
}
export const itemColumns: ColumnDef<ItemSchemaType>[] = [
  {
    accessorKey: "itemNumber",
    header: "Item #",
    cell: ({ row }) => {
      const itemNumber = row.getValue("itemNumber") as string
      // Apply w-fit to make the container only as wide as the content
      // Add whitespace-nowrap to prevent wrapping
      return <span className="w-fit whitespace-nowrap text-gray-800 font-semibold">#{itemNumber}</span>
    },
    enableSorting: true,
    filterFn: stringContainsFilter,
    // size: 'auto', // Use size: 'auto' or let CSS handle it via w-fit
    // Or remove size completely if w-fit works well
    size: 60, // Let's give it a small base size, w-fit might override
    minSize: 60, // Prevent it from becoming too small
  },
  {
    accessorKey: "itemType",
    header: () => <div className="text-center">Type</div>,
    cell: ({ row }) => {
      const type = row.getValue("itemType") as string | null
      // TypeCell already enforces w-24
      return type ? <TypeCell type={type} /> : null
    },
    enableSorting: true,
    filterFn: arrayIncludesFilter,
    size: 96, // Explicit size corresponding to w-24 (6rem = 96px)
    maxSize: 96, // Enforce max width at the table level too
  },
  {
    accessorKey: "itemName",
    header: "Item Name",
    cell: ({ row }) => {
      // Removed fixed width classes, let the column size dictate width
      // Keep whitespace-nowrap and text-ellipsis if desired (though truncate is better for ellipsis)
      // Using truncate here might be better if you expect overflow even in the largest column
      // return <span className="whitespace-nowrap overflow-hidden text-ellipsis">{row.original.itemName}</span>
      // Or simply let it wrap if needed:
      return <span>{row.original.itemName}</span>
    },
    enableSorting: true,
    filterFn: stringContainsFilter,
    size: 400, // Assign a large size to indicate it should be the biggest
    // Tanstack will distribute remaining space; a larger size gets proportionally more
  },
  {
    accessorKey: "itemStock",
    header: () => <div className="text-center">Total Stock</div>,
    cell: ({ row }) => {
      const stockData = row.getValue("itemStock") as ItemSchemaType[ "itemStock" ];
      const stockLevel = stockData ? stockData.reduce((acc, curr) => acc + curr.currentQuantity, 0) : 0;
      // Center the text using text-center on the parent TD already handles this.
      // If not, add text-center here.
      return <p className="text-center">{stockLevel.toString()}</p>
    },
    enableSorting: false, // Sorting might be complex/slow depending on data shape
    filterFn: stockLevelFilter,
    size: 100, // A reasonable fixed size for stock numbers
    maxSize: 100,
  },
  {
    accessorKey: "customerDisplayName",
    header: "Customer",
    cell: ({ row }) => {
      const customer = row.getValue("customerDisplayName") as string
      // Apply truncate for fixed width and ellipsis on overflow
      return <span className="block truncate">{customer}</span> // Use block or inline-block with truncate
    },
    enableSorting: true,
    filterFn: arrayIncludesFilter,
    size: 180, // Set a fixed size (e.g., 180px) - adjust as needed
    minSize: 150,
    maxSize: 180,
  },
]


// export const TypeCell = ({ type }: { type: string }) => {
//   // w-24 ensures the max width. inline-block allows width to apply.
//   // text-center centers the content within the badge.
//   const baseStyles = "w-24 px-2 py-1 rounded-full text-xs font-semibold text-center inline-block whitespace-nowrap"

//   // Simple mapping for demonstration; replace with actual logic if needed
//   const typeColor = type === 'Finished Good' ? 'bg-green-100 text-green-800' :
//     type === 'Raw Material' ? 'bg-blue-100 text-blue-800' :
//       'bg-gray-100 text-gray-800'; // Default

//   return (
//     <span className={cn(baseStyles, typeColor)}>{type}</span>
//   )
// }

export const TypeCell = ({ type }: { type: string }) => {
  // This fixed width (w-24) and inline-block are key
  const baseStyles = "w-24 px-2 py-1 rounded-full text-xs font-semibold text-center inline-block whitespace-nowrap"

  return (
    // The span IS the badge with fixed width
    <span className={cn(type, baseStyles)}>{type}</span>
  )
}