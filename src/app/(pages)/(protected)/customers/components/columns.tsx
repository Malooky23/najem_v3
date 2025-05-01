import type { ColumnDef, FilterFn } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { ItemSchemaType } from "@/types/items"
import { ItemStock } from "@/server/db/schema"
import { Button } from "@/components/ui/button"
import { Edit, MoreHorizontal, Plus, RefreshCcw, ArrowUpDown} from "lucide-react"
import { EnrichedCustomer } from "@/types/customer"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

// / Custom filter functions with proper implementation
const arrayIncludesFilter: FilterFn<EnrichedCustomer> = (row, columnId, filterValue) => {
  // Return true for empty filters
  if (!filterValue || !Array.isArray(filterValue) || filterValue.length === 0) return true

  // Get the value from the row
  const value = row.getValue(columnId)

  // Return true if ANY of the filter values exactly match the cell value
  return filterValue.includes(value)
}

const stringContainsFilter: FilterFn<EnrichedCustomer> = (row, columnId, filterValue) => {
  // Return true for empty filters
  if (filterValue === undefined || filterValue === '') return true

  // Get the value and convert to lowercase string
  const value = String(row.getValue(columnId)).toLowerCase()

  // Check if value contains the filterValue
  return value.includes(String(filterValue).toLowerCase())
}



export const customerColumns: ColumnDef<EnrichedCustomer>[] = [
  {
    accessorKey: "customerNumber",
    // header: "#",
    header: () => <div className="text-start ">#</div>,

    cell: ({ row }) => {
      const customerNumber = row.getValue("customerNumber") as string
      return <span className="text-gray-800 font-semibold ">#{customerNumber}</span>
    },
    enableSorting: true,
    filterFn: stringContainsFilter, // Use stringContains for partial matches
    size: 50

  },
  {
    accessorKey: "customerType",
    header: () => <div className="flex justify-center text-center">Type</div>,
    cell: ({ row }) => {
      const type = row.getValue("customerType") as string | null
      return type ?
        <div className="flex items-center justify-center">
          <Badge className={cn("text-center min-w-24 justify-center  text-black", type === "BUSINESS" ? "bg-purple-100 " : "bg-blue-100 text-black")}>{type}</Badge>
        </div>
        : null
    },
    // cell: ({ row }) => {
    //   const type = row.getValue("customerType") as string | null
    //   return type ? <TypeCell type={type} /> : null
    // },
    enableSorting: true,
    filterFn: arrayIncludesFilter, // Use arrayIncludes for exact matches
    size: 130

  },
  {
    accessorKey: "displayName",
    // header: "Display Name",
    header: () => <div className="text-center">Display Name</div>,

    cell: ({ row }) => {
      const customer = row.getValue("displayName") as string
      return <span className="pl-2 font-medium">{customer}</span>
    },
    enableSorting: true,
    filterFn: arrayIncludesFilter, // Use arrayIncludes for exact matches
    size: 650
  },
  {
    accessorKey: "country",
    header: "Country",
    enableSorting: false,
    filterFn: stringContainsFilter, // Use custom stockLevel filter
    size: 300
  },
  {
    id: "actions", // Unique ID for the column
    header: ({ table }) => { // Use context to get table instance
      return (

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div className="flex w-full justify-end">

              <Button variant="ghost" size="sm"
                className="h-8 w-8 p-0"
              // className="flex justify-end items-center bg-red-400 p-0"

              >
                <MoreHorizontal className="h-4 w-4" />
                <span className="sr-only">Column options</span>
              </Button>
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Columns</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide()) // Only show hideable columns
              .map((column) => {
                // Removed check for isSpannedOver meta
                return (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize"
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) => column.toggleVisibility(!!value)}
                  >
                    {/* Simple ID display, adjust formatting as needed */}
                    {column.id.replace(/([A-Z])/g, " $1").trim()}
                  </DropdownMenuCheckboxItem>
                )
              })}
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
    cell: ({ row }) => {
      // Function to handle edit action (define or pass this function)
      const handleEdit = (customer: EnrichedCustomer) => {
        console.log("Edit customer:", customer.customerId);
        // Add your edit logic here (e.g., open a dialog)
      };

      return (
        <div className="flex w-full justify-end">

          <Button
            className=" justify-end items-center  pr-2"
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation(); // Prevent row click handler if necessary
              handleEdit(row.original)
            }
            }
          >
            <Edit />
          </Button>
          <Button
            className=" justify-end items-center  p-0"
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation(); // Prevent row click handler if necessary
              handleEdit(row.original)
            }
            }
          >
            <Plus />
          </Button>
        </div>
      );
    },
    enableSorting: false,
    enableHiding: false, // This column itself shouldn't be hideable via the dropdown
    meta: { isActionColumn: true }, // Optional meta flag
    // size: 2
  }
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
      <Badge className={cn(type, baseStyles)}>{type}</Badge>
    </div>
  )
}
