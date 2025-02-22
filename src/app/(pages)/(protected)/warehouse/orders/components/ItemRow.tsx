import { Plus, Minus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface ItemRowProps {
  index: number
  itemId: string
  quantity: number
  items: { itemId: string; itemName: string }[]
  onItemChange: (value: string) => void
  onQuantityChange: (value: number) => void
  onRemove: () => void
}

export function ItemRow({ index, itemId, quantity, items, onItemChange, onQuantityChange, onRemove }: ItemRowProps) {
  return (
    <tr className="border-b">
      <td className="py-2 px-4 text-center">{index + 1}</td>
      <td className="py-2 px-4">
        <Select value={itemId} onValueChange={onItemChange}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select an item" />
          </SelectTrigger>
          <SelectContent>
            {items.map((item) => (
              <SelectItem key={item.itemId} value={item.itemId}>
                {item.itemName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </td>
      <td className="py-2 px-4">
        <div className="flex items-center space-x-2">
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => onQuantityChange(Math.max(1, quantity - 1))}
          >
            <Minus className="h-4 w-4" />
          </Button>
          <Input
            type="number"
            value={quantity}
            onChange={(e) => onQuantityChange(Number.parseInt(e.target.value) || 1)}
            className="w-20 text-center"
            min="1"
          />
          <Button type="button" variant="outline" size="icon" onClick={() => onQuantityChange(quantity + 1)}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </td>
      <td className="py-2 px-4">
        <Button type="button" variant="destructive" size="sm" onClick={onRemove}>
          Remove
        </Button>
      </td>
    </tr>
  )
}

