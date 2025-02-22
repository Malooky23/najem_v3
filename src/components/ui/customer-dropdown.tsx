
import React, { use, useEffect, useState } from 'react'
import { Check, ChevronsUpDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import {
  Command,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import { EnrichedCustomer } from '@/types/customer'
import { SelectItem } from './select'
import { useFormContext } from "react-hook-form";

interface CustomerSelectorProps {
  customersInput: EnrichedCustomer[]
  value?: string | null
  onChange?: (value: string | null) => void
  isRequired?: boolean
}

const CustomerSelector = ({
  customersInput,
  value,
  onChange,
  isRequired,
  
}: CustomerSelectorProps) => {
  const [openCustomerDropdown, setOpenCustomerDropdown] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState<EnrichedCustomer | null>(null)
  // const methods = useFormContext() // retrieve those props
  const formContextValue = useFormContext();
  // console.log("useFormContext Value:", formContextValue); // ADD THIS LINE

  useEffect(() => {
    if (value) {
      const customer = customersInput.find(c => c.customerId === value);
      if (customer) {
        setSelectedCustomer(customer);
      }
    }
  }, [value, customersInput]);

  const handleCustomerSelect = (customer: EnrichedCustomer | null) => {
    onChange?.(customer!.customerId)
    setOpenCustomerDropdown(false)
    setSelectedCustomer(customer)
    // formContextValue.trigger('customerId')
    // console.log(formContextValue.watch())

  }

  return (
    <div className="flex gap-4 relative">
      <input
        type="hidden"
        name="customerId" // **Name attribute here for FormData**
        value={selectedCustomer?.customerId ? selectedCustomer?.customerId : ""} // Use selectedCustomer to set value
        // required={isRequired}

      />
      <Popover
        modal={true}
        open={openCustomerDropdown}
        onOpenChange={setOpenCustomerDropdown}
      >
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={openCustomerDropdown}
            className="w-full justify-between"
          >
            {value ? (
              <div className="flex items-center gap-2">
                <span>{selectedCustomer?.displayName}</span>
              </div>
            ) : (
              <span>Select Customer...</span>
            )}
            <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          align="start"
          className="w-[--radix-popover-trigger-width] p-0"
        >
          <Command>
            <CommandInput placeholder="Search customer..."
              name="customerId"
            />
            <CommandList>


              <CommandEmpty>No customer found.</CommandEmpty>
              <CommandGroup>
                <ScrollArea className="">
                  {customersInput.map((customer) => (
                    <CommandItem
                      key={customer.customerId}
                      value={customer.displayName!}
                      onSelect={() => {
                        handleCustomerSelect(customer)
                      }}
                      className="flex cursor-pointer items-center justify-between text-sm"
                    >
                      <div className="flex items-center gap-2">
                        <span>{customer.displayName}</span>
                      </div>
                      <Check
                        className={cn(
                          'h-4 w-4',
                          selectedCustomer?.customerId === customer.customerId
                            ? 'opacity-100'
                            : 'opacity-0',
                        )}
                      />
                    </CommandItem>
                  ))}
                  <ScrollBar orientation="vertical" />
                </ScrollArea>
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  )
}

export default CustomerSelector