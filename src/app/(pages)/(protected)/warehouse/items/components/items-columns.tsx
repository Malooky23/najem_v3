"use client"

import { EnrichedItemsSchema, EnrichedItemsType } from "@/types/items"
import { ColumnDef } from "@tanstack/react-table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"

import { MoreHorizontal } from "lucide-react"
import { cn } from "@/lib/utils"
import { ArrowUpDown } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"

// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.

const TypeCell = ({ type }: { type: string }) => {
  const getTypeStyles = (type: string) => {
    const baseStyles = "px-2 py-1 rounded-full text-xs font-semibold w-24 text-center inline-block"; // changed from w-20 to w-24
    const types: { [key: string]: string } = {
      // "BOX": "bg-blue-100 text-blue-800",
      // "CARTON": "bg-green-100 text-green-800",
      // "SACK": "bg-purple-100 text-purple-800",
      // "EQUIPMENT": "bg-red-100 text-red-800",
      // "OTHER": "bg-gray-100 text-gray-800",
      "CARTON": "bg-blue-500/20 text-blue-700",
      "BOX": "bg-green-500/20 text-green-700",
      "SACK": "bg-purple-500/20 text-purple-700",
      "EQUIPMENT": "bg-orange-500/20 text-orange-700",
      "PALLET": "bg-yellow-100 text-yellow-800",
      "CAR": "bg-amber-900/30 text-gray-700",
      "OTHER": "bg-pink-500/20 text-gray-700",
      // "CUSTOMER": "bg-red-500/20 text-gray-700",
      // "EMPLOYEE": "bg-violet-500/100 text-gray-700",
    };
    return cn(baseStyles, types[type] || types["OTHER"]);
  };



  return (
    <div className="flex items-center justify-center w-full">
      <span className={getTypeStyles(type)}>{type}</span>
    </div>
  );
};

interface ColumnMeta {
  width?: string;
}

export const itemsColumns: ColumnDef<EnrichedItemsType>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
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
  {
    accessorKey: "itemNumber",
    // header: () => <div className="text-left">#</div>,
    header: ({ column }) => {
      return (
        <Button
        className=" flex justify-start px-0"
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          #
          <ArrowUpDown className=" h-4 w-4" />
        </Button>
      )
    },
  },
  {
    accessorKey: "itemType",
    header: () => (
      <div className="text-center w-full">Type</div>
    ),
    cell: ({ row }) => <TypeCell type={row.getValue("itemType")} />,
  },
  {
    accessorKey: "itemName",
    header: "Name",
  },
  {
    accessorKey: "itemStock",
    // header: "Total Stock",
    header: () => (
      <div className="text-center ">Total Stock</div>
    ),
    cell: ({ row }) => {
      const itemStock = row.getValue("itemStock") as Array<{ currentQuantity: number }> || [];
      const totalStock = itemStock.reduce((sum, item) => sum + (item.currentQuantity || 0), 0);
      return (
        <div className=" text-center border-x border-slate-300">
          <span className="">{totalStock}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "customerDisplayName",
    header: "Customer Name",
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const payment = row.original

      return (
        <div className="flex justify-end">

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => null}
            >
              Copy payment ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>View customer</DropdownMenuItem>
            <DropdownMenuItem>View payment details</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        </div>

      )
    },
  },
]
