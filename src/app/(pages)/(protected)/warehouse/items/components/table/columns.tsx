import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { ItemSchemaType } from "@/types/items"
import { format } from "date-fns"

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
        <Badge variant="outline" className="capitalize">
          {type.toLowerCase().replace('_', ' ')}
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
    accessorKey: "createdAt",
    header: "Created",
    cell: ({ row }) => {
      const date = row.getValue("createdAt") as Date
      return format(date, 'dd/MM/yyyy')
    },
  },
  {
    accessorKey: "updatedAt",
    header: "Updated",
    cell: ({ row }) => {
      const date = row.getValue("updatedAt") as Date | null
      return date ? format(date, 'dd/MM/yyyy') : '-'
    },
  },
]