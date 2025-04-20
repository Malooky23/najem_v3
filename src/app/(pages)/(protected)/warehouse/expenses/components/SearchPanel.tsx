// src/app/(pages)/(protected)/warehouse/expenses/components/SearchPanel.tsx
'use client'
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input"
// Removed: import { useDebounce } from "@/hooks/useDebounce";
import { Trash2Icon } from "lucide-react";
// Removed: import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useState, useEffect } from "react"

// Removed: Param constants

interface SearchPanelProps {
  initialValue: string; // Controlled value from parent
  onSearchChange: (value: string) => void; // Callback to parent
}

export default function SearchPanel({ initialValue, onSearchChange }: SearchPanelProps) {
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

  return (
    <>
      <Input
        className="bg-white"
        placeholder="Search expenses..."
        value={inputValue} // Controlled input using local state
        onChange={handleInputChange} // Use internal handler
      />
      {/* This button now only clears the search input via the parent */}
      <Button
        variant="outline"
        size="icon"
        onClick={clearSearch}
        title="Clear search" // Updated title
        disabled={!inputValue} // Disable if input is already empty
      >
        <Trash2Icon className="h-4 w-4" />
      </Button>
    </>
  );
}
