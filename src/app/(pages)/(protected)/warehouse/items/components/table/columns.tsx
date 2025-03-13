import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { ItemSchemaType } from "@/types/items"
import { format } from "date-fns"
import { ItemStock } from "@/server/db/schema"
import { cn } from "@/lib/utils"

export const itemColumns: ColumnDef<ItemSchemaType>[] = [
  {
    accessorKey: "itemNumber",
    header: "Item ID",
    cell: ({ row }) => {
      const itemNumber = row.getValue("itemNumber") as string
      return  <span className="text-gray-500 font-semibold">#{itemNumber}</span>
    },
  },
  {
    accessorKey: "itemType",
    header: "Type",
    cell: ({ row }) => {
      const type = row.getValue("itemType") as string | null
      return type ? (
        <TypeCell type={type} />
      ) : null
    },
  },
  {
    accessorKey: "itemName",
    header: "Name",
  },
  // {
  //   accessorKey: "itemBrand",
  //   header: "Brand",
  // },
  // {
  //   accessorKey: "itemModel",
  //   header: "Model",
  // },
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


const TypeCell = ({ type }: { type: string }) => {
  const getTypeStyles = (type: string) => {
    const baseStyles = "px-2 py-1 rounded-full text-xs font-semibold w-24 text-center inline-block"; // changed from w-20 to w-24
    const types: { [key: string]: string } = {
      "CARTON": "bg-blue-500/20 text-blue-700",
      "BOX": "bg-green-500/20 text-green-700",
      "SACK": "bg-purple-500/20 text-purple-700",
      "EQUIPMENT": "bg-orange-500/20 text-orange-700",
      "PALLET": "bg-yellow-100 text-yellow-800",
      "CAR": "bg-amber-900/30 text-gray-700",
      "OTHER": "bg-pink-500/20 text-gray-700",
    };
    return cn(baseStyles, types[type] || types["OTHER"]);
  };

  return (
    <div className="flex-shrink-0 items-center justify-start ">
      <span className={getTypeStyles(type)}>{type}</span>
    </div>
  );
};