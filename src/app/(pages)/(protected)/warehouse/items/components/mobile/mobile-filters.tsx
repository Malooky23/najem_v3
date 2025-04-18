"use client"

import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"

import type { FilterState, ItemSchemaType } from "@/types/items"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useState } from "react"
import { Input } from "@/components/ui/input"

interface MobileFiltersProps {
  activeFilters: FilterState
  handleTypeFilter: (type: string) => void
  handleCustomerFilter: (customer: string) => void
  handleItemSelection: (itemId: string) => void
  clearAllFilters: () => void
  availableItemTypes: string[]
  availableCustomers: string[]
  data: ItemSchemaType[]
}

export function MobileFilters({
  activeFilters,
  handleTypeFilter,
  handleCustomerFilter,
  handleItemSelection,
  clearAllFilters,
  availableItemTypes,
  availableCustomers,
  data,
}: MobileFiltersProps) {
  const [itemSearchQuery, setItemSearchQuery] = useState("")

  // Filter items based on search query
  const filteredItems = data.filter(
    (item) =>
      item.itemName.toLowerCase().includes(itemSearchQuery.toLowerCase()) ||
      item.itemNumber.toString().includes(itemSearchQuery.toLowerCase()),
  )

  return (
    <Sheet>
      <SheetTrigger asChild>
        <span id="filter-trigger-target" className="hidden" />
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Filter Items</SheetTitle>
          <SheetDescription>Apply filters to narrow down your inventory items</SheetDescription>
        </SheetHeader>
        <div className="py-4">
          <Accordion type="multiple" className="w-full">
            <AccordionItem value="type">
              <AccordionTrigger>Item Type</AccordionTrigger>
              <AccordionContent>
                <div className="space-y-2">
                  {availableItemTypes.map((type) => (
                    <div key={type} className="flex items-center space-x-2">
                      <Checkbox
                        id={`mobile-type-${type}`}
                        checked={activeFilters.types.includes(type)}
                        onCheckedChange={() => handleTypeFilter(type)}
                      />
                      <Label htmlFor={`mobile-type-${type}`}>{type}</Label>
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
                        id={`mobile-customer-${customer}`}
                        checked={activeFilters.customers.includes(customer)}
                        onCheckedChange={() => handleCustomerFilter(customer)}
                      />
                      <Label htmlFor={`mobile-customer-${customer}`}>{customer}</Label>
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
                        <div key={item.itemId} className="flex items-center space-x-2">
                          <Checkbox
                            id={`mobile-item-${item.itemId}`}
                            checked={activeFilters.selectedItems.includes(item.itemId)}
                            onCheckedChange={() => handleItemSelection(item.itemId)}
                          />
                          <Label htmlFor={`mobile-item-${item.itemId}`} className="flex flex-col">
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
        </div>
        <SheetFooter className="flex flex-col gap-2 sm:flex-row">
          <Button variant="outline" className="w-full" onClick={clearAllFilters}>
            Clear Filters
          </Button>
          <SheetClose asChild>
            <Button className="w-full">Apply Filters</Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}

