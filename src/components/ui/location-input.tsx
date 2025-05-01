'use client'
import React, { useState, useCallback, useMemo, useEffect } from 'react' // Import useEffect
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

// Import JSON data directly
import countries from '@/lib/constants/countries.json'
import states from '@/lib/constants/states.json'

interface Timezone {
  zoneName: string
  gmtOffset: number
  gmtOffsetName: string
  abbreviation: string
  tzName: string
}

export interface CountryProps {
  id: number | null
  name: string | null
  iso3: string | null
  iso2: string | null
  numeric_code: string | null
  phone_code: string | null
  capital: string | null
  currency: string | null
  currency_name: string | null
  currency_symbol: string | null
  tld: string | null
  native: string | null
  region: string | null
  region_id: string | null
  subregion: string | null
  subregion_id: string | null
  nationality: string | null
  timezones: Timezone[] | null
  translations: Record<string, string> | null
  latitude: string | null
  longitude: string | null
  emoji: string | null
  emojiU: string | null
}

interface StateProps {
  id: number
  name: string
  country_id: number
  country_code: string
  country_name: string
  state_code: string
  type: string | null
  latitude: string
  longitude: string
}

interface LocationSelectorProps {
  isStateNeeded?: boolean
  disabled?: boolean
  onCountryChange?: (country: CountryProps | null) => void
  onStateChange?: (state: StateProps | null) => void
  initialCountry?: string | null
}

const LocationSelector = ({
  isStateNeeded,
  disabled,
  onCountryChange,
  onStateChange,
  initialCountry = null
}: LocationSelectorProps) => {
  const countriesData = countries as CountryProps[]
  const statesData = states as StateProps[]

  // Function to find the country object based on name
  const findCountryObject = (name: string | null): CountryProps | null => {
    if (!name) return null;
    return countriesData.find(c => c.name === name) ?? null;
  }

  const [ selectedCountry, setSelectedCountry ] = useState<CountryProps | null>(() => findCountryObject(initialCountry)); // Initialize state
  const [ selectedState, setSelectedState ] = useState<StateProps | null>(null)
  const [ openCountryDropdown, setOpenCountryDropdown ] = useState(false)
  const [ openStateDropdown, setOpenStateDropdown ] = useState(false)
  // Effect to update internal state if the initialCountry prop changes (e.g., from RHF Controller)
  useEffect(() => {
    setSelectedCountry(findCountryObject(initialCountry));
  }, [initialCountry]); // Dependency array ensures this runs when initialCountry changes

  // Cast imported JSON data to their respective types

  // Filter states for selected country
  const availableStates = statesData.filter(
    (state) => state.country_id === selectedCountry?.id,
  )

  const handleCountrySelect = useCallback((country: CountryProps | null) => {
    setSelectedCountry(country)
    setSelectedState(null) // Reset state when country changes
    onCountryChange?.(country)
    onStateChange?.(null)
  }, [ onCountryChange, onStateChange ])

  const handleStateSelect = useCallback((state: StateProps | null) => {
    setSelectedState(state)
    onStateChange?.(state)
  }, [ onStateChange ])

  return (
    <div className="flex gap-4 relative ">
      {/* Country Selector */}
      <Popover modal={true} open={openCountryDropdown} onOpenChange={setOpenCountryDropdown}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={openCountryDropdown}
            disabled={disabled}
            className="w-full justify-between"
          >
            {selectedCountry ? (
              <div className="flex items-center gap-2">
                <span>{selectedCountry.emoji}</span>
                <span>{selectedCountry.name}</span>
              </div>
            ) : (
              <span>Select Country...</span>
            )}
            <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent align="start" className="w-[--radix-popover-trigger-width] p-0">
          <Command>
            <CommandInput placeholder="Search country..." />
            <CommandList>
              <CommandEmpty>No country found.</CommandEmpty>
              <CommandGroup>
                <ScrollArea className="">
                  {countriesData.map((country) => (
                    <CommandItem
                      key={country.id}
                      value={country.name ?? ''} // Provide empty string if name is null
                      onSelect={() => {
                        handleCountrySelect(country)
                        setOpenCountryDropdown(false)
                      }}
                      className="flex cursor-pointer items-center justify-between text-sm"
                    >
                      <div className="flex items-center gap-2">
                        <span>{country.emoji}</span>
                        <span>{country.name}</span>
                      </div>
                      <Check
                        className={cn(
                          'h-4 w-4',
                          selectedCountry?.id === country.id
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

      {/* State Selector - Only shown if selected country has states */}
      {availableStates.length > 0 && isStateNeeded && (
        <Popover open={openStateDropdown} onOpenChange={setOpenStateDropdown}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={openStateDropdown}
              disabled={!selectedCountry}
              className="w-full justify-between"
            >
              {selectedState ? (
                <span>{selectedState.name}</span>
              ) : (
                <span>Select State...</span>
              )}
              <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent align="start" className="w-[--radix-popover-trigger-width] p-0">
            <Command>
              <CommandInput placeholder="Search state..." />
              <CommandList>
                <CommandEmpty>No state found.</CommandEmpty>
                <CommandGroup>
                  <ScrollArea className="h-[300px]">
                    {availableStates.map((state) => (
                      <CommandItem
                        key={state.id}
                        value={state.name}
                        onSelect={() => {
                          handleStateSelect(state)
                          setOpenStateDropdown(false)
                        }}
                        className="flex cursor-pointer items-center justify-between text-sm"
                      >
                        <span>{state.name}</span>
                        <Check
                          className={cn(
                            'h-4 w-4',
                            selectedState?.id === state.id
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
      )}
    </div>
  )
}

export default React.memo(LocationSelector)
