"use client"

import { useEffect, useState, useCallback, useMemo } from 'react'
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
import { EnrichedCustomer } from '@/types/customer'
import { Loader2 } from 'lucide-react'
import { useCustomers } from '@/hooks/data-fetcher'
import { cn } from '@/lib/utils'

interface CustomerDropdownProps {
  // New interface
  selectedCustomerId?: string;
  onSelect?: (customerId: string) => void;

  customersInput?: EnrichedCustomer[];
  isLoading?: boolean
  isError?: boolean
  value?: string | null;
  onChange?: (value: string | null) => void;
  isRequired?: boolean;

  // Common props
  disabled?: boolean;
  isModal?: boolean;
  className?: string
}

export function CustomerDropdown({
  selectedCustomerId,
  onSelect,
  customersInput,
  isLoading = false,
  isError = false,
  value,
  onChange,
  isRequired,
  disabled = false,
  isModal = false,
  className
}: CustomerDropdownProps) {
  const [ open, setOpen ] = useState(false);
  const [ selectedCustomer, setSelectedCustomer ] = useState<EnrichedCustomer | null>(null);

  // Only fetch customers if we don't have customersInput
  const shouldFetchCustomers = !customersInput;
  const { data: fetchedCustomers = [], isLoading: isLoadingOG, isError: isErrorOG} = useCustomers(shouldFetchCustomers);
  // Memoize customers array to prevent unnecessary re-renders
  const customers = useMemo(() =>
    customersInput || fetchedCustomers || [],
    [ customersInput, fetchedCustomers ]
  );

  // Memoize effective customer ID calculation
  const effectiveCustomerId = useMemo(() =>
    selectedCustomerId || value || null,
    [ selectedCustomerId, value ]
  );

  // Optimize the effect that updates the selected customer
  useEffect(() => {
    if (!effectiveCustomerId || customers.length === 0) {
      if (selectedCustomer !== null) {
        setSelectedCustomer(null);
      }
      return;
    }

    const customer = customers.find(c => c.customerId === effectiveCustomerId);

    if (customer && (!selectedCustomer || selectedCustomer.customerId !== customer.customerId)) {
      setSelectedCustomer(customer);
    }
  }, [ effectiveCustomerId, customers, selectedCustomer ]);

  // Memoize the selection handler to prevent recreation on each render
  const handleSelect = useCallback((customer: EnrichedCustomer) => {
    setSelectedCustomer(customer);

    if (onSelect) {
      onSelect(customer.customerId);
    } else if (onChange) {
      onChange(customer.customerId);
    }

    setOpen(false);
  }, [ onSelect, onChange ]);

  return (
    <Popover open={open} onOpenChange={setOpen} modal={isModal}>
      <PopoverTrigger asChild className={className}>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          // --- MODIFICATION START ---
          // Apply width, overflow, and text handling classes
          className={cn(
            "w-full justify-between overflow-hidden whitespace-nowrap text-ellipsis",
            className // Ensure any passed className is also applied
          )}
          // --- MODIFICATION END ---
          disabled={disabled || isLoading}
        >
          {selectedCustomer ? (
            <span className='truncate'>{selectedCustomer.displayName}</span>
          ) : (
            <span className="text-muted-foreground">Select customer...</span>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0  opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
        <Command>
          <CommandInput placeholder="Search customers..." />
          <CommandList>
            <CommandEmpty>No customers found</CommandEmpty>
            {isLoading || isLoadingOG && !customersInput ? (
              <div className="flex items-center justify-center p-4">
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                <span>Loading customers...</span>
              </div>
            ) : isError || isErrorOG && !customersInput ? (
              <div className="flex items-center justify-center p-4 text-red-500">
                Error loading customers
              </div>
            ) : (
              <CommandGroup>
                <ScrollArea className="h-[200px]">
                  {customers.map((customer) => (
                    <CommandItem
                      key={customer.customerId}
                      value={customer.displayName}
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
  );
}

export default CustomerDropdown;