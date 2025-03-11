"use client"

import { useEffect, useState, useCallback } from 'react'
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
import { Loader2 } from 'lucide-react'
import { useCustomers } from '@/hooks/data-fetcher'

// Support both old and new prop interfaces
interface CustomerDropdownProps {
  // New interface
  selectedCustomerId?: string;
  onSelect?: (customerId: string) => void;
  
  // Old interface
  customersInput?: EnrichedCustomer[];
  value?: string | null;
  onChange?: (value: string | null) => void;
  isRequired?: boolean;
  
  // Common props
  disabled?: boolean;
}

export function CustomerDropdown({
  // Use all possible props with defaults
  selectedCustomerId,
  onSelect,
  customersInput,
  value,
  onChange,
  isRequired,
  disabled = false,
}: CustomerDropdownProps) {
  const [open, setOpen] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState<EnrichedCustomer | null>(null)
  
  // Use the real customers hook if customersInput is not provided
  const { data: fetchedCustomers = [], isLoading, isError } = useCustomers();
  
  // Use the provided customers list or the fetched one
  const customers = customersInput || fetchedCustomers || [];
  
  // Determine the actual customer ID from the different prop options
  const effectiveCustomerId = selectedCustomerId || value || null;
  
  // Update selected customer when the id changes
  useEffect(() => {
    if (effectiveCustomerId && customers.length > 0) {
      const customer = customers.find(c => c.customerId === effectiveCustomerId);
      if (customer) {
        setSelectedCustomer(customer);
      }
    } else {
      setSelectedCustomer(null);
    }
  }, [effectiveCustomerId, customers]);

  const handleSelect = useCallback((customer: EnrichedCustomer) => {
    setSelectedCustomer(customer);
    
    // Call the appropriate callback based on which prop was provided
    if (onSelect) {
      onSelect(customer.customerId);
    } else if (onChange) {
      onChange(customer.customerId);
    }
    
    setOpen(false);
  }, [onSelect, onChange]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
          disabled={disabled || isLoading}
        >
          {selectedCustomer ? (
            <span>{selectedCustomer.displayName}</span>
          ) : (
            <span className="text-muted-foreground">Select customer...</span>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
        <Command>
          <CommandInput placeholder="Search customers..." />
          <CommandList>
            <CommandEmpty>No customers found</CommandEmpty>
            {isLoading && !customersInput ? (
              <div className="flex items-center justify-center p-4">
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                <span>Loading customers...</span>
              </div>
            ) : isError && !customersInput ? (
              <div className="flex items-center justify-center p-4 text-red-500">
                Error loading customers
              </div>
            ) : (
              <CommandGroup>
                <ScrollArea className="h-[200px]">
                  {customers.map((customer) => (
                    <CommandItem
                      key={customer.customerId}
                      value={customer.displayName || customer.customerId}
                      onSelect={() => handleSelect(customer)}
                    >
                      <span>{customer.displayName || `Customer ${customer.customerId}`}</span>
                      {selectedCustomer?.customerId === customer.customerId && (
                        <Check className="ml-auto h-4 w-4" />
                      )}
                    </CommandItem>
                  ))}
                  <ScrollBar orientation="vertical" />
                </ScrollArea>
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
      
      {/* Hidden input for form data */}
      {isRequired !== undefined && (
        <input
          type="hidden"
          name="customerId"
          value={selectedCustomer?.customerId || ""}
          required={isRequired}
        />
      )}
    </Popover>
  )
}

export default CustomerDropdown