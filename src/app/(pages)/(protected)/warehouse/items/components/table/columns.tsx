import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { ItemSchemaType } from "@/types/items"
import { format } from "date-fns"
import { ItemStock } from "@/server/db/schema"

export const itemColumns: ColumnDef<ItemSchemaType>[] = [
  {
    accessorKey: "itemName",
    header: "Name",
  },
  {
    accessorKey: "itemType",
    header: "Type",
    cell: ({ row }) => {
      const type = row.getValue("itemType") as string | null
      return type ? (
        <Badge variant="outline" className="w-full">
          {/* {type.toLowerCase().replace('_', ' ')} */}
          {type}
        </Badge>
      ) : null
    },
  },
  {
    accessorKey: "itemBrand",
    header: "Brand",
  },
  {
    accessorKey: "itemModel",
    header: "Model",
  },
  {
    accessorKey: "itemNumber",
    header: "Item Number",
  },
  {
    accessorKey: "itemStock",
    // header: "Item Stock",
    header: () => (
      <div className="text-center ">Total Stock</div>
    ),
    cell: ({ row }) => {
      const stock = row.getValue("itemStock") as ItemStock[]
      const stockLevel = stock.map(item => item.currentQuantity)
        .reduce((acc, curr) => acc + curr, 0)
        if (stockLevel === 0) {
          return <Badge className="flex mx-auto justify-center max-w-[100px] rounded-none " variant='secondary'>Out of stock</Badge>
        }
      return <p className="flex mx-auto justify-center max-w-[100px] text-center  ">{stockLevel.toString()}</p>
    }
  },
  // {
  //   accessorKey: "createdAt",
  //   header: "Created",
  //   cell: ({ row }) => {
  //     const date = row.getValue("createdAt") as Date
  //     return format(date, 'dd/MM/yyyy')
  //   },
  // },
  // {
  //   accessorKey: "updatedAt",
  //   header: "Updated",
  //   cell: ({ row }) => {
  //     const date = row.getValue("updatedAt") as Date | null
  //     return date ? format(date, 'dd/MM/yyyy') : '-'
  //   },
  // },
]