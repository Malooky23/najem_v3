import React, { useCallback } from 'react';
import { cn } from "@/lib/utils";
import { ChevronUp, ChevronDown } from "lucide-react"; 

interface SortHeaderProps {
  columnId: string;
  originalHeader: string | React.ReactNode;
  sortField?: string;
  sortDirection?: 'asc' | 'desc';
  onSort?: (sort: { field: string, direction: 'asc' | 'desc' }) => void;
  centerHeaders?: string[]; // Array of column IDs to center
}

const SortHeader = React.memo(({
  columnId,
  originalHeader,
  sortField,
  sortDirection,
  onSort,
  centerHeaders = [] // Default to empty array if not provided
}: SortHeaderProps) => {
  const handleSortClick = useCallback(() => {
    const isAsc = sortField === columnId && sortDirection === 'asc';
    const newDirection = isAsc ? 'desc' : 'asc';
    onSort?.({ field: columnId, direction: newDirection });
  }, [columnId, sortField, sortDirection, onSort]);

  // Check if this column's ID is in the centerHeaders array
  const shouldCenter = centerHeaders.includes(columnId);

  return (
    <div
      className={cn(
        "flex items-center gap-1 cursor-pointer select-none",
        shouldCenter ? "justify-center" : "justify-start"
      )}
      onClick={handleSortClick}
    >
      <span
        className={cn(
          shouldCenter ? "text-center" : "text-left"
        )}
      >
        {originalHeader}
      </span>

      <div className="flex flex-col">
        <ChevronUp
          strokeWidth="4px"
          className={cn(
            "h-4 w-4 -mb-1",
            sortField === columnId && sortDirection === 'asc'
              ? "text-foreground"
              : "text-muted-foreground/30"
          )}
        />
        <ChevronDown
          strokeWidth="4px"
          className={cn(
            "h-4 w-4 -mt-1",
            sortField === columnId && sortDirection === 'desc'
              ? "text-foreground"
              : "text-muted-foreground/30"
          )}
        />
      </div>
    </div>
  );
});
SortHeader.displayName = "SortHeader";

export default SortHeader;