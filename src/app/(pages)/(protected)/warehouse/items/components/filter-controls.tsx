"use client"

import { Button } from "@/components/ui/button"
import { SlidersHorizontal } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { FilterState } from "../page"
import type { ItemSchemaType } from "@/types/items"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useState } from "react"
import { Input } from "@/components/ui/input"

interface FilterControlsProps {
  activeFilters: FilterState
  handleTypeFilter: (type: string) => void
  handleCustomerFilter: (customer: string) => void
  handleItemSelection: (itemId: string) => void
  clearAllFilters: () => void
  availableItemTypes: string[]
  availableCustomers: string[]
  data: ItemSchemaType[]
}

export function FilterControls({
  activeFilters,
  handleTypeFilter,
  handleCustomerFilter,
  handleItemSelection,
  clearAllFilters,
  availableItemTypes,
  availableCustomers,
  data,
}: FilterControlsProps) {
  const [itemSearchQuery, setItemSearchQuery] = useState("")

  // Filter items based on search query
  const filteredItems = data.filter(
    (item) =>
      item.itemName.toLowerCase().includes(itemSearchQuery.toLowerCase()) ||
      item.itemNumber.toString().includes(itemSearchQuery.toLowerCase()),
  )

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="h-9 gap-1">
          <SlidersHorizontal className="h-4 w-4" />
          <span className="hidden sm:inline">Advanced Filters</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[350px] p-4" align="end">
        <div className="space-y-4">
          <h4 className="font-medium">Filter Items</h4>
          <Accordion type="multiple" className="w-full">
            <AccordionItem value="type">
              <AccordionTrigger>Item Type</AccordionTrigger>
              <AccordionContent>
                <div className="space-y-2">
                  {availableItemTypes.map((type) => (
                    <div key={type} className="flex items-center space-x-2">
                      <Checkbox
                        id={`type-${type}`}
                        checked={activeFilters.types.includes(type)}
                        onCheckedChange={() => handleTypeFilter(type)}
                      />
                      <Label htmlFor={`type-${type}`}>{type}</Label>
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="customer">
              <AccordionTrigger>Customer</AccordionTrigger>
              <AccordionContent>
                <div className="space-y-2">
                  {availableCustomers.map((customer) => (
                    <div key={customer} className="flex items-center space-x-2">
                      <Checkbox
                        id={`customer-${customer}`}
                        checked={activeFilters.customers.includes(customer)}
                        onCheckedChange={() => handleCustomerFilter(customer)}
                      />
                      <Label htmlFor={`customer-${customer}`}>{customer}</Label>
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="specific-items">
              <AccordionTrigger>Specific Items</AccordionTrigger>
              <AccordionContent>
                <div className="space-y-3">
                  <Input
                    placeholder="Search items..."
                    value={itemSearchQuery}
                    onChange={(e) => setItemSearchQuery(e.target.value)}
                    className="mb-2"
                  />
                  <ScrollArea className="h-[200px]">
                    <div className="space-y-2">
                      {filteredItems.map((item) => (
                        <div key={item.itemName} className="flex items-center space-x-2">
                          <Checkbox
                            id={`item-${item.itemName}`}
                            checked={activeFilters.selectedItems.includes(item.itemName)}
                            onCheckedChange={() => handleItemSelection(item.itemName)}
                          />
                          <Label htmlFor={`item-${item.itemName}`} className="flex flex-col">
                            <span>{item.itemName}</span>
                            <span className="text-xs text-muted-foreground">#{item.itemNumber}</span>
                          </Label>
                        </div>
                      ))}
                      {filteredItems.length === 0 && (
                        <p className="text-sm text-muted-foreground py-2">No items found</p>
                      )}
                    </div>
                  </ScrollArea>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
          <Button variant="outline" size="sm" className="w-full mt-2" onClick={clearAllFilters}>
            Clear All Filters
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}

