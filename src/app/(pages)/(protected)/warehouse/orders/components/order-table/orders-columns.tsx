"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import { ArrowUpDown, MoreHorizontal } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { EnrichedOrders } from "@/types/orders"
import { formatInTimeZone, toDate } from "date-fns-tz"


const StatusCell = ({ status }: { status: string }) => {
  const getStatusStyles = (status: string) => {
    const baseStyles = "px-2 py-1 rounded-full text-xs font-semibold w-24 text-center inline-block"
    const statuses: { [key: string]: string } = {
      "DRAFT": "bg-gray-500/20 text-gray-700",
      "PENDING": "bg-yellow-500/20 text-yellow-700",
      "PROCESSING": "bg-blue-500/20 text-blue-700",
      "COMPLETED": "bg-green-500/20 text-green-700",
      "READY": "bg-purple-500/20 text-purple-700",
      "CANCELLED": "bg-red-500/20 text-red-700",
    }
    return `${baseStyles} ${statuses[status] || statuses["PENDING"]}`
  }

  return (
    <div className="flex items-center justify-center w-full">
      <span className={getStatusStyles(status)}>{status}</span>
    </div>
  )
}

export const ordersColumns: ColumnDef<EnrichedOrders>[] = [
  // {
  //   id: "select",
  //   header: ({ table }) => (
  //     <Checkbox
  //       checked={table.getIsAllPageRowsSelected()}
  //       onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
  //       aria-label="Select all"
  //     />
  //   ),
  //   cell: ({ row }) => (
  //     <Checkbox
  //       checked={row.getIsSelected()}
  //       onCheckedChange={(value) => row.toggleSelected(!!value)}
  //       aria-label="Select row"
  //     />
  //   ),
  //   enableSorting: false,
  //   enableHiding: false,
  // },
  {
    id: "select",
    header: ({ table }) => (
      <div className="flex justify-center" onClick={(e) => e.stopPropagation()}>
        <Checkbox
          checked={table.getIsAllPageRowsSelected()}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      </div>
    ),
    cell: ({ row }) => (
      <div className=" flex justify-center"
      onClick={(e) => e.stopPropagation()}>
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      </div>
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "orderNumber",
    header:  "#",
    cell: ({ row }) => <div className="flex flex-1 justify-center"> {row.getValue("orderNumber")}</div>,

    // header: ({ column }) => {
    //   return (
    //     <Button
    //       variant="ghost"
    //       className="flex justify-start px-0"
    //       onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
    //     >
    //       #
    //       <ArrowUpDown className="h-4 w-4" />
    //     </Button>
    //   )
    // },
  },
  {
    accessorKey: "status",
    header: "Status",
    // header: () => <div className="text-center w-full">Status</div>,
    cell: ({ row }) => <StatusCell status={row.getValue("status")} />,
  },
  {
    accessorKey: "items",
    header: "Total Items",
    // header: () => <div className="text-center w-full">Status</div>,
    cell: ({ row }) => {
      const itemsValue = row.getValue("items");
      let itemsArray = [];
    
      if (Array.isArray(itemsValue)) {
        itemsArray = itemsValue;
      } else if (typeof itemsValue === 'string') {
        try {
          itemsArray = JSON.parse(itemsValue);
        } catch (error) {
          console.error("Error parsing JSON string:", error);
          // Handle the error appropriately, maybe display 0 or an error message
          return <div>Error</div>; // Or return <div>0</div>;
        }
      } else {
        // Handle cases where itemsValue is neither an array nor a string, if necessary
        return <div>N/A</div>; // Or return <div>0</div>; or handle differently
      }
    
      return <div className="text-center">{Array.isArray(itemsArray) ? itemsArray.length : 0}</div>;
    },
      },
  {
    accessorKey: "customerName",
    header: "Customer",
  },
  {
    accessorKey: "createdAt",
    cell: ({ row }) => {
      return (
        <div className=" ">
          { formatInTimeZone(toDate(row.getValue("createdAt")),"Asia/Dubai","EEE, dd-MM-yyyy") }

        </div>)},
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Date
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => navigator.clipboard.writeText(row.original.orderId)}>
              Copy order ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>View details</DropdownMenuItem>
            <DropdownMenuItem>Update status</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]