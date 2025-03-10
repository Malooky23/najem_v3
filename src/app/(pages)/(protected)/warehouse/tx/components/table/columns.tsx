"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import { ArrowUpDown, MoreHorizontal, ChevronUp, ChevronDown } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {  format, formatInTimeZone, toDate } from "date-fns-tz"
import { EnrichedStockMovementView, StockMovementSortFields } from "@/types/stockMovement"
import { cn } from "@/lib/utils"
// import {  } from "date-fns"

const StatusCell = ({ status }: { status: string }) => {
  const getStatusStyles = (status: string) => {
    const baseStyles = "px-2 py-1 rounded-full text-xs font-semibold w-24 text-center inline-block"
    const statuses: { [key: string]: string } = {
      "IN": "bg-green-500/20 text-green-700",
      "OUT": "bg-red-500/20 text-red-700"
    }
    return `${baseStyles} ${statuses[status] || "bg-gray-500/20 text-gray-700"}`
  }

  return (
    <div className="flex items-center justify-center w-full">
      <span className={getStatusStyles(status)}>{status}</span>
    </div>
  )
}

export const stockMovementColumns: ColumnDef<EnrichedStockMovementView>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  // {
  //   id: "select",
  //   header: ({ table }) => (
  //     <div className="flex justify-center" onClick={(e) => e.stopPropagation()}>
  //       <Checkbox
  //         checked={table.getIsAllPageRowsSelected()}
  //         onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
  //         aria-label="Select all"
  //       />
  //     </div>
  //   ),
  //   cell: ({ row }) => (
  //     <div className=" flex justify-center"
  //       onClick={(e) => e.stopPropagation()}>
  //       <Checkbox
  //         checked={row.getIsSelected()}
  //         onCheckedChange={(value) => row.toggleSelected(!!value)}
  //         aria-label="Select row"
  //       />
  //     </div>
  //   ),
  //   enableSorting: false,
  //   enableHiding: false,
  // },
  {
    accessorKey: "movementNumber",
    header: "#",
    enableSorting: true,
  },
  {
    accessorKey: "movementType",
    header: "Movement Type",
    enableSorting: true,
    cell: ({ row }) => <StatusCell status={row.getValue("movementType")} />,
  },
  {
    accessorKey: "quantity",
    header: "Quantity",
    enableSorting: true,
    cell: ({ row }) => {
      const quantity = row.getValue("quantity") as number;
      return (
        <div className={cn(
          "font-medium",
          " text-center"
        )}>
          {quantity}
        </div>
      );
    },
  },
  {
    accessorKey: "stockLevelAfter",
    header: "Stock Level",
    enableSorting: true,
    // header: ({  }) => (
    //   <div className="flex items-center justify-center">Stock Level</div>),
    cell: ({ row }) => {
      const level = row.getValue("stockLevelAfter") as number;
      return (
        <div className={cn(
          "font-medium",
          // level <= 0 ? "text-red-600" : level < 10 ? "text-amber-600" : "text-green-600"
          "border-x text-center"
        )}>
          {level}
        </div>
      );
    },
  },
  {
    accessorKey: "itemName",
    header: "Item Name",
    enableSorting: true,
  },
  {
    accessorKey: "customerDisplayName",
    header: "Customer",
    enableSorting: true,
    cell: ({ row }) => (
      <div className=" text-ellipsis">
        {row.getValue("customerDisplayName")}
        </div>
    ),
  },
  {
    accessorKey: "createdAt",
    header: "Date",
    cell: ({ row }) => (
      <div className="flex  truncate text-ellipsis">
        {formatInTimeZone(toDate(row.getValue("createdAt")), "Asia/Dubai", "EEE, HH:mm dd-MM-yyyy")}
        </div>


    ),
    enableSorting: true,
  },
  {
    id: "actions",
    enableSorting: false,
    cell: ({ row }) => {
      return (
        <div className="flex items-center justify-end">
        <DropdownMenu >
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => navigator.clipboard.writeText(row.original.movementId)}>
              What do you think?
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Something we can do</DropdownMenuItem>
            <DropdownMenuItem>View Customer Details?</DropdownMenuItem>
            <DropdownMenuItem>Print Movement Record</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        </div>
      )
    },
  },
]