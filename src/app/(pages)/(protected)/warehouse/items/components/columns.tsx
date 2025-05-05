// src/app/(pages)/(protected)/warehouse/items/components/columns.tsx
import type { ColumnDef, FilterFn, Row, SortingFn } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { ItemSchemaType } from "@/types/items"
import { Button } from "@/components/ui/button"
import { RefreshCcw } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

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

// export const itemColumns: ColumnDef<ItemSchemaType>[] = [
//   {
//     accessorKey: "itemNumber",
//     header: "Item #",
//     cell: ({ row }) => {
//       const itemNumber = row.getValue("itemNumber") as string
//       // Apply w-fit to make the container only as wide as the content
//       // Add whitespace-nowrap to prevent wrapping
//       return <span className={cn("block text-left pl-1 whitespace-nowrap text-gray-800 font-semibold",
//         " truncate whitespace-normal text-nowrap max-w-[50px] bg-red-100 "
//       )}>#{itemNumber}</span>
//     },
//     size:10,
//     maxSize:10,
//     enableSorting: true,
//     filterFn: stringContainsFilter,
//     // size: 'auto', // Use size: 'auto' or let CSS handle it via w-fit
//     // Or remove size completely if w-fit works well
//   },
//   {
//     accessorKey: "itemType",
//     header: () => <span className="text-center">Type</span>,
//     cell: ({ row }) => {
//       const type = row.getValue("itemType") as string | null
//       // TypeCell already enforces w-24
//       return type ? <TypeCell type={type} /> : null
//     },
//     enableSorting: true,
//     filterFn: arrayIncludesFilter,
//     size: 50, // Explicit size corresponding to w-24 (6rem = 96px)
//     maxSize: 50, // Enforce max width at the table level too
//   },
//   {
//     accessorKey: "itemName",
//     header: "Item Name",
//     cell: ({ row }) => {
//       // Removed fixed width classes, let the column size dictate width
//       // Keep whitespace-nowrap and text-ellipsis if desired (though truncate is better for ellipsis)
//       // Using truncate here might be better if you expect overflow even in the largest column
//       // return <span className="whitespace-nowrap overflow-hidden text-ellipsis">{row.original.itemName}</span>
//       // Or simply let it wrap if needed:
//       return <span>{row.original.itemName}</span>
//     },
//     enableSorting: true,
//     filterFn: stringContainsFilter,
//   },
//   {
//     accessorKey: "itemStock",
//     header: () => <div className="text-center">Total Stock</div>,
//     cell: ({ row }) => {
//       const stockData = row.getValue("itemStock") as ItemSchemaType[ "itemStock" ];
//       const stockLevel = stockData ? stockData.reduce((acc, curr) => acc + curr.currentQuantity, 0) : 0;
//       // Center the text using text-center on the parent TD already handles this.
//       // If not, add text-center here.
//       return <p className="text-center">{stockLevel.toString()}</p>
//     },
//     enableSorting: false, // Sorting might be complex/slow depending on data shape
//     filterFn: stockLevelFilter,
//     size: 100, // A reasonable fixed size for stock numbers
//     maxSize: 100,
//   },
//   {
//     accessorKey: "customerDisplayName",
//     header: "Customer",
//     cell: ({ row }) => {
//       const customer = row.getValue("customerDisplayName") as string
//       // Apply truncate for fixed width and ellipsis on overflow
//       return <span className="block truncate whitespace-normal text-nowrap max-w-[300px] bg-red-200">{customer}</span> // Use block or inline-block with truncate
//     },
//     enableSorting: true,
//     filterFn: arrayIncludesFilter,
//     size: 50, // Set a fixed size (e.g., 180px) - adjust as needed
//     minSize: 10,
//     maxSize: 60
//   },
// ]


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
const stockLevelSortFn: SortingFn<ItemSchemaType> = (
  rowA: Row<ItemSchemaType>,
  rowB: Row<ItemSchemaType>,
  columnId: string,
): number => {
  const stockA = rowA.getValue(columnId) as ItemSchemaType[ 'itemStock' ];
  const stockB = rowB.getValue(columnId) as ItemSchemaType[ 'itemStock' ];

  const totalStockA = stockA ? stockA.reduce((acc, curr) => acc + curr.currentQuantity, 0) : 0;
  const totalStockB = stockB ? stockB.reduce((acc, curr) => acc + curr.currentQuantity, 0) : 0;

  if (totalStockA < totalStockB) {
    return -1; // A comes before B
  }
  if (totalStockA > totalStockB) {
    return 1; // A comes after B
  }
  return 0; // A and B are equal
};
export const itemColumns: ColumnDef<ItemSchemaType>[] = [
  {
    accessorKey: "itemNumber",
    header: "Item #",
    cell: ({ row }) => {
      const itemNumber = row.getValue("itemNumber") as string
      // Fit content, left-aligned, no wrap
      return <span className="block text-left pl-1 whitespace-nowrap text-gray-800 font-semibold">#{itemNumber}</span>
    },
    size: 50, // Fixed size, adjust if #numbers can be much longer/shorter
    enableResizing: false, // Disable manual resizing
    enableSorting: true,
    filterFn: stringContainsFilter,
  },
  {
    accessorKey: "itemType",
    header: () => <div className="text-center w-full">Type</div>, // Ensure header text is centered
    cell: ({ row }) => {
      const type = row.getValue("itemType") as string | null
      // TypeCell provides fixed width and styling. Cell content will be centered by TableCell class.
      return type ? <TypeCell type={type} /> : null
    },
    size: 105, // Corresponds to w-24 (6rem = 96px) in TypeCell
    enableResizing: false, // Disable manual resizing
    enableSorting: true,
    filterFn: arrayIncludesFilter,
  },
  {
    accessorKey: "itemName",
    header: "Item Name",
    cell: ({ row }) => {
      // Use truncate for ellipsis on overflow
      // return <span className="block truncate">{row.original.itemName}</span>
      return <TooltipProvider delayDuration={100}>
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="block truncate">{row.original.itemName}</span>
          </TooltipTrigger>
          <TooltipContent className="bg-white border-1 border-slate-200 max-w-xl text-black text-lg ">
           {/* <h3 className="font-bold">Item Name:</h3> */}
            <span className="text-justify">{row.original.itemName}</span>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    },
    // Let this column take up remaining space
    size: 350, // A large initial size, it will grow/shrink based on available space
    maxSize: 350, // A large initial size, it will grow/shrink based on available space
    minSize: 50, // Ensure it doesn't become too small
    enableResizing: false, // Disable manual resizing but allow flexibility via minSize/size
    enableSorting: true,
    filterFn: arrayIncludesFilter,
  },
  {
    accessorKey: "itemStock",
    header: () => <div className="text-center ">Total Stock</div>, // Ensure header text is centered
    cell: ({ row }) => {
      const stockData = row.getValue("itemStock") as ItemSchemaType[ "itemStock" ];
      const stockLevel = stockData ? stockData.reduce((acc, curr) => acc + curr.currentQuantity, 0) : 0;
      // Cell content will be centered by TableCell class.
      return <p>{stockLevel}</p> // No specific styling needed here, TableCell handles it
    },
    size: 100, // Fixed size for stock numbers, adjust if needed
    enableResizing: false, // Disable manual resizing
    enableSorting: true,
    filterFn: stockLevelFilter,
    sortingFn: stockLevelSortFn
  },
  {
    accessorKey: "customerDisplayName",
    header: "Customer",
    cell: ({ row }) => {
      const customer = row.getValue("customerDisplayName") as string
      // Use truncate for ellipsis on overflow
      return <span className="block truncate">{customer}</span>
    },
    size: 180,
    minSize: 10,

    enableResizing: false, // Disable manual resizing
    enableSorting: true,
    filterFn: arrayIncludesFilter,
  },
]

export const TypeCell = ({ type }: { type: string }) => {
  // This fixed width (w-24) and inline-block are key
  const baseStyles = cn("w-24 px-2 py-1 rounded-full text-xs font-semibold text-center inline-block whitespace-nowrap",
    // type === "SINGLE" && "bg-red-500/20 text-red-700"
  )

  return (
    <span className={cn(type, baseStyles)}>{type}</span>
  )
}

