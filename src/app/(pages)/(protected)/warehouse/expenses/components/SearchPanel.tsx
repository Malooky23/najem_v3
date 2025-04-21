// src/app/(pages)/(protected)/warehouse/expenses/components/SearchPanel.tsx
'use client'
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input"
import { useOrderExpenses } from "@/hooks/data/useExpenses";
import { ChevronDown, ChevronUp, LoaderCircle, Search, Trash2Icon, X } from "lucide-react";
import { useState, useEffect } from "react"
import { ExpenseFilterPanel, ExpenseFilterValues } from "./ExpenseFilterPanel";

// Removed: Param constants

interface SearchPanelProps {
  initialValue: string; // Controlled value from parent
  onSearchChange: (value: string) => void; // Callback to parent
  initialFilterValues: ExpenseFilterValues
  customerOptions?: string[]
  expenseItemOptions?: string[]
  onFilterChange: (filters: ExpenseFilterValues) => void
  onClearAll: () => void
}

export default function SearchPanel({ initialValue, onSearchChange, onFilterChange, onClearAll, initialFilterValues }: SearchPanelProps) {
  // Removed: router, pathname, searchParams

  // Local state for the input field's value, initialized by prop
  const [ inputValue, setInputValue ] = useState(initialValue);

  // Removed: Debounce logic and effects for URL syncing

  // Effect to sync local state if the initialValue prop changes externally
  // (e.g., parent component clears the search)
  useEffect(() => {
    // Only update if the prop value is actually different from the input's current value
    // This prevents resetting the input while the user is typing after an external change
    if (inputValue !== initialValue) {
      setInputValue(initialValue);
    }
    // Only run when the initialValue prop changes
  }, [ initialValue ]); // Dependency on initialValue prop

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue); // Update local state immediately for responsiveness
    onSearchChange(newValue); // Notify parent (which will handle debouncing and URL update)
  };

  const clearSearch = () => {
    // Check if already empty before calling parent
    if (inputValue === '') return;
    setInputValue(''); // Clear local state
    onSearchChange(''); // Notify parent
  };

  const [ isExpanded, setIsExpanded ] = useState(false);

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  const { isLoading, isFetching } = useOrderExpenses()

  return (
    <>
      {/* <div className="flex">

        <Input
          className="bg-white pr-8"
          placeholder="Search expenses...hhhhhhhhhhhhhh"
          value={inputValue} // Controlled input using local state
          onChange={handleInputChange} // Use internal handler
        />
        <Button
          className="bg-transparent hover:bg-transparent hover:scale-[1.2] transition-all duration-300 -translate-x-8"
          variant="ghost"
          size="icon"
          onClick={clearSearch}
          title="Clear search" // Updated title
          disabled={!inputValue} // Disable if input is already empty
        >
          <X className="h-4 w-4" />
        </Button>
      </div> */}

      <div className="flex-1   relative rounded-lg bg-white">
        {isLoading || isFetching ? (
          <LoaderCircle
            className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground animate-spin"
          />
        ) : (
          inputValue.length > 0 ?
            <Button
                className="bg-transparent hover:bg-transparent hover:scale-[1.2] transition-all duration-300 absolute left-2 top-2.5 h-4 w-4 text-muted-foreground"
              variant="ghost"
              size="icon"
              onClick={clearSearch}
              title="Clear search" // Updated title
              disabled={!inputValue} // Disable if input is already empty
            >
              <X className="h-4 w-4" />
            </Button> :
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        )}

        <Input
          placeholder="Search movements..."
          value={inputValue}
          onChange={handleInputChange}
          className="pl-8 pr-10"
        />

        <ExpenseFilterPanel
          initialFilterValues={initialFilterValues}
          customerOptions={ []}
          expenseItemOptions={[ "Sack Small", "Sack Large", "Forklift Offloading", "Forklift Loading", "Labour Full Day" ] }
          onFilterChange={onFilterChange}
          onClearAll={onClearAll}
        >
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleExpanded}
            disabled={isLoading}
            className="absolute right-0 top-0 h-9 w-9"
          >
            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        </ExpenseFilterPanel>
      </div>
    </>
  );
}
