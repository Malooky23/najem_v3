import type { ColumnDef, FilterFn } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { ItemSchemaType } from "@/types/items"
import { ItemStock } from "@/server/db/schema"
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
    const stockData = row.getValue("itemStock") as ItemSchemaType["itemStock"];

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
    header: "Item ID",
    cell: ({ row }) => {
      const itemNumber = row.getValue("itemNumber") as string
      return <span className="text-gray-800 font-semibold">#{itemNumber}</span>
    },
    enableSorting: true,
    filterFn: stringContainsFilter, // Use stringContains for partial matches
  },
  {
    accessorKey: "itemType",
    header: () => <div className="text-center w-24">Type</div>,
    cell: ({ row }) => {
      const type = row.getValue("itemType") as string | null
      return type ? <TypeCell type={type} /> : null
    },
    enableSorting: true,
    filterFn: arrayIncludesFilter, // Use arrayIncludes for exact matches
  },
  {
    accessorKey: "itemName",
    header: "Name",
    enableSorting: true,
    filterFn: stringContainsFilter, // Use stringContains for partial matches
  },
  {
        accessorKey: "customerDisplayName",
    header: "Customer",
    cell: ({ row }) => {
      const customer = row.getValue("customerDisplayName") as string
      return <span className="font-medium">{customer}</span>
    },
    enableSorting: true,
    filterFn: arrayIncludesFilter, // Use arrayIncludes for exact matches
  },
  {
    accessorKey: "itemStock",
    header: () => <div className="text-center">Total Stock</div>,
        cell: ({ row }) => {
            const stockData = row.getValue("itemStock") as ItemSchemaType["itemStock"];
            const stockLevel = stockData ? stockData.reduce((acc, curr) => acc + curr.currentQuantity, 0) : 0;
      if (stockLevel === 0) {
        return (
          <Badge className="flex mx-auto justify-center max-w-[100px] rounded-none" variant="secondary">
            Out of stock
          </Badge>
        )
      }
      return <p className="flex mx-auto justify-center max-w-[100px] text-center">{stockLevel.toString()}</p>
    },
    enableSorting: false,
    filterFn: stockLevelFilter, // Use custom stockLevel filter
  },
  
]

export const TypeCell = ({ type }: { type: string }) => {
  // const getTypeStyles = (type: string) => {
    const baseStyles = "px-2 py-1 rounded-full text-xs font-semibold w-24 text-center inline-block"
  //   const types: { [key: string]: string } = {
  //     CARTON: "bg-blue-500/20 text-blue-700",
  //     BOX: "bg-green-500/20 text-green-700",
  //     SACK: "bg-purple-500/20 text-purple-700",
  //     EQUIPMENT: "bg-orange-500/20 text-orange-700",
  //     PALLET: "bg-yellow-100 text-yellow-800",
  //     CAR: "bg-amber-900/30 text-gray-700",
  //     OTHER: "bg-pink-500/20 text-gray-700",
  //   }
  //   // return cn(baseStyles, types[type] || types["OTHER"])
  // }

  return (
    <div className="flex-shrink-0 items-center justify-start">
      {/* <span className={getTypeStyles(type)}>{type}</span> */}
      <span className={cn(type, baseStyles)}>{type}</span>
    </div>
  )
}
