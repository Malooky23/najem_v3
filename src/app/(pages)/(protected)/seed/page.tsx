'use client'
import { PlusCircle } from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { create } from "./actions"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"

export default function SeedPage() {
  const [items, setItems] = useState<any[]>([]);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [count, setCount] = useState("1000");

  async function handleFormAction(formData: FormData) {
    setIsLoading(true);
    const result = await create(formData);
    setIsLoading(false);
    
    if (result?.success && result.items) {
      setItems(result.items);
      if (result.items.length > 0) {
        setSelectedItem(result.items[0]);
      }
    }
  }

  const countOptions = [1, 5, 10, 25, 50, 1000];

  return (
    <div className="flex flex-col items-center justify-center h-full gap-8 p-4">
      <form action={handleFormAction} className="flex flex-col items-center gap-4">
        <div className="flex items-end gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="count">Number of items to generate</Label>
            <Select 
              name="count" 
              defaultValue={count} 
              onValueChange={setCount}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select count" />
              </SelectTrigger>
              <SelectContent>
                {countOptions.map(option => (
                  <SelectItem key={option} value={option.toString()}>
                    {option} {option === 1 ? 'item' : 'items'}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button 
            size="lg" 
            type="submit"
            className="px-6"
            disabled={isLoading}
          >
            <PlusCircle className="mr-2 h-5 w-5" /> 
            {isLoading ? "Generating..." : `Generate ${count} Random Item${count === "1" ? "" : "s"}`}
          </Button>
        </div>
      </form>

      {items.length > 0 && (
        <div className="w-full max-w-4xl">
          <div className="mb-4">
            <Label>Select item to view details</Label>
            <Select 
              value={selectedItem?.id || ""} 
              onValueChange={(value) => {
                const found = items.find(item => item.id === value);
                if (found) setSelectedItem(found);
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select an item" />
              </SelectTrigger>
              <SelectContent>
                {items.map(item => (
                  <SelectItem key={item.id} value={item.id}>
                    {item.itemName} ({item.itemType})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {selectedItem && (
            <Card className="w-full">
              <CardHeader>
                <CardTitle>{selectedItem.itemName}</CardTitle>
                <CardDescription>Item Details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm font-medium">Brand</p>
                    <p>{selectedItem.itemBrand}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Model</p>
                    <p>{selectedItem.itemModel}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Type</p>
                    <Badge variant="outline">{selectedItem.itemType}</Badge>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Barcode</p>
                    <p className="font-mono">{selectedItem.itemBarcode}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Country of Origin</p>
                    <p>{selectedItem.itemCountryOfOrigin}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Weight</p>
                    <p>{selectedItem.weightGrams}g</p>
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium mb-1">Dimensions</p>
                  <p>W: {selectedItem.dimensions.width}mm × H: {selectedItem.dimensions.height}mm × L: {selectedItem.dimensions.length}mm</p>
                </div>

                {selectedItem.notes && (
                  <div>
                    <p className="text-sm font-medium mb-1">Notes</p>
                    <p className="text-sm text-muted-foreground">{selectedItem.notes}</p>
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex justify-between text-sm text-muted-foreground">
                <span>Item ID: {selectedItem.id}</span>
                <Badge variant="secondary">
                  {items.findIndex(item => item.id === selectedItem.id) + 1} of {items.length}
                </Badge>
              </CardFooter>
            </Card>
          )}
          
          <div className="mt-4">
            <p className="text-sm text-muted-foreground">
              Generated {items.length} item{items.length === 1 ? "" : "s"} successfully
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
