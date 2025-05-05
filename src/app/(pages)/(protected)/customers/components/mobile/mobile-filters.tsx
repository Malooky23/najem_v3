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

import { CustomerFilterState } from "@/types/customer"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useState } from "react"
import { Input } from "@/components/ui/input"
import { EnrichedCustomer } from "@/types/customer"

interface MobileFiltersProps {
  activeFilters: CustomerFilterState
  handleTypeFilter: (type: string) => void
  handleCustomerFilter: (customer: string) => void
  handleItemSelection: (itemId: string) => void
  clearAllFilters: () => void
  availableItemTypes: string[]
  availableCustomers: string[]
  data: EnrichedCustomer[]
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
      item.displayName.toLowerCase().includes(itemSearchQuery.toLowerCase()) ||
      item.customerNumber.toString().includes(itemSearchQuery.toLowerCase()),
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
                        <div key={item.customerId} className="flex items-center space-x-2">
                          <Checkbox
                            id={`mobile-item-${item.customerId}`}
                            checked={activeFilters.selectedItems.includes(item.customerId)}
                            onCheckedChange={() => handleItemSelection(item.customerId)}
                          />
                          <Label htmlFor={`mobile-item-${item.customerId}`} className="flex flex-col">
                            <span>{item.displayName}</span>
                            <span className="text-xs text-muted-foreground">#{item.customerNumber}</span>
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

