// src/app/(pages)/(protected)/warehouse/items/components/columns.tsx
import type { Column, ColumnDef, FilterFn, Row, SortingFn } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { ItemSchemaType } from "@/types/items"
import { Button } from "@/components/ui/button"
import { RefreshCcw } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useEffect, useRef, useState } from "react"

// / Custom filter functions with proper implementation
const arrayIncludesFilter: FilterFn<ItemSchemaType> = (row, columnId, filterValue) => {
  // Return true for empty filters
  if (!filterValue || !Array.isArray(filterValue) || filterValue.length === 0) return true

  // Get the value from the row
  const value = row.getValue(columnId)

  // Return true if ANY of the filter values exactly match the cell value
  return filterValue.includes(value)
}

const stringContainsFilter: FilterFn<ItemSchemaType> = (row, columnId, filterValue) => {
  // Return true for empty filters
  if (filterValue === undefined || filterValue === '') return true

  // Get the value and convert to lowercase string
  const value = String(row.getValue(columnId)).toLowerCase()

  // Check if value contains the filterValue
  return value.includes(String(filterValue).toLowerCase())
}

const stockLevelFilter: FilterFn<ItemSchemaType> = (row, columnId, filterValue) => {
  // Return true for empty filters
  if (!filterValue) return true

  // Get the stock data
  const stockData = row.getValue("itemStock") as ItemSchemaType[ "itemStock" ];

  // Calculate total stock level
  const stockLevel = stockData ? stockData.reduce((acc, curr) => acc + curr.currentQuantity, 0) : 0;

  // Apply specific filter logic based on filterValue
  if (filterValue === "out-of-stock") {
    return stockLevel === 0
  } else if (filterValue === "low-stock") {
    return stockLevel > 0 && stockLevel < 20
  }

  return true
}

const stockLevelSortFn: SortingFn<ItemSchemaType> = (
  rowA: Row<ItemSchemaType>,
  rowB: Row<ItemSchemaType>,
  columnId: string,
): number => {
  const stockA = rowA.getValue(columnId) as ItemSchemaType[ 'itemStock' ];
  const stockB = rowB.getValue(columnId) as ItemSchemaType[ 'itemStock' ];

  const totalStockA = stockA ? stockA.reduce((acc, curr) => acc + curr.currentQuantity, 0) : 0;
  const totalStockB = stockB ? stockB.reduce((acc, curr) => acc + curr.currentQuantity, 0) : 0;

  if (totalStockA < totalStockB) {
    return -1; // A comes before B
  }
  if (totalStockA > totalStockB) {
    return 1; // A comes after B
  }
  return 0; // A and B are equal
};
export const itemColumns: ColumnDef<ItemSchemaType>[] = [
  {
    accessorKey: "itemNumber",
    header: "Item #",
    cell: ({ row }) => {
      const itemNumber = row.getValue("itemNumber") as string
      // Fit content, left-aligned, no wrap
      return <span className="block text-left pl-1 whitespace-nowrap text-gray-800 font-semibold">#{itemNumber}</span>
    },
    size: 50, // Fixed size, adjust if #numbers can be much longer/shorter
    enableResizing: false, // Disable manual resizing
    enableSorting: true,
    filterFn: stringContainsFilter,
  },
  {
    accessorKey: "itemType",
    header: () => <div className="text-center w-full">Type</div>, // Ensure header text is centered
    cell: ({ row }) => {
      const type = row.getValue("itemType") as string | null
      // TypeCell provides fixed width and styling. Cell content will be centered by TableCell class.
      return type ? <TypeCell type={type} /> : null
    },
    size: 105, // Corresponds to w-24 (6rem = 96px) in TypeCell
    enableResizing: false, // Disable manual resizing
    enableSorting: true,
    filterFn: arrayIncludesFilter,
  },
  // {
  //   accessorKey: "itemName",
  //   header: "Item Name",
  //   // cell: ({ row }) => {
  //   //   // Use truncate for ellipsis on overflow
  //   //   // return <span className="block truncate">{row.original.itemName}</span>
  //   //   return <TooltipProvider disableHoverableContent={row.original.itemName.length < 90} delayDuration={100}>
  //   //     <Tooltip>
  //   //       <TooltipTrigger asChild>
  //   //         <span className="block truncate">{row.original.itemName}</span>
  //   //       </TooltipTrigger>
  //   //       <TooltipContent className={cn("bg-white border-1 border-slate-200 max-w-xl text-black text-lg ",
  //   //         row.original.itemName.length < 90 && "hidden"
  //   //       )}>
  //   //        {/* <h3 className="font-bold">Item Name:</h3> */}
  //   //         <span className="text-justify">{row.original.itemName}</span>
  //   //       </TooltipContent>
  //   //     </Tooltip>
  //   //   </TooltipProvider>
  //   cell: ({ row }) => {
  //     const [ isOpen, setIsOpen ] = useState(false);
  //     // State to track if the text is actually truncated
  //     const [ isTruncated, setIsTruncated ] = useState(false);
  //     // Ref to the span element
  //     const textRef = useRef<HTMLSpanElement>(null);

  //     const itemName = row.original.itemName;

  //     // Effect to check for truncation after render
  //     useEffect(() => {
  //       // Use a setTimeout to ensure the element is fully rendered and laid out
  //       const timer = setTimeout(() => {
  //         if (textRef.current) {
  //           const element = textRef.current;
  //           // Check if scrollWidth (full content width) is greater than clientWidth (visible width)
  //           const truncated = element.scrollWidth > element.clientWidth;
  //           setIsTruncated(truncated);

  //           // Log the values to debug
  //           console.log(
  //             itemName,
  //             "Truncated check:",
  //             truncated,
  //             "clientWidth:",
  //             element.clientWidth,
  //             "scrollWidth:",
  //             element.scrollWidth
  //           );
  //         } else {
  //           console.log(itemName, "Ref not available in useEffect");
  //         }
  //       }, 0); // Delay by 0ms

  //       // Cleanup the timer if the component unmounts or dependencies change
  //       return () => clearTimeout(timer);

  //     }, [ itemName ]); // Re-run check if item name changes
  //     // Only render tooltip logic if the text is potentially long/needs check
  //     // We can still render the span unconditionally and let useEffect determine truncation
  //     return (
  //       <TooltipProvider disableHoverableContent={false} delayDuration={100}>
  //         <Tooltip open={isOpen} onOpenChange={setIsOpen}>
  //           <TooltipTrigger asChild>
  //             <span
  //               ref={textRef}
  //               className={cn("truncate cursor-pointer")}
  //             >
  //               {itemName}
  //             </span>
  //           </TooltipTrigger>
  //             {isTruncated&&             
  //             <TooltipContent className="bg-white border-1 border-slate-200 max-w-xl text-black text-lg text-justify">
  //             {isTruncated}-{itemName}
  //             </TooltipContent>
  //   }
  //         </Tooltip>
  //       </TooltipProvider>
  //     );
  //   },
  //   // Let this column take up remaining space
  //   size: 350, // A large initial size, it will grow/shrink based on available space
  //   maxSize: 350, // A large initial size, it will grow/shrink based on available space
  //   minSize: 50, // Ensure it doesn't become too small
  //   enableResizing: false, // Disable manual resizing but allow flexibility via minSize/size
  //   enableSorting: true,
  //   filterFn: arrayIncludesFilter,
  // },
  {
    accessorKey: "itemName",
    header: "Item Name",
    cell: ({ row, column }: { row: Row<ItemSchemaType>; column: Column<ItemSchemaType, unknown> }) => { // Get column for size
      const [ isTooltipOpen, setIsTooltipOpen ] = useState(false);
      const [ isTextTruncated, setIsTextTruncated ] = useState(false);
      const textRef = useRef<HTMLSpanElement>(null);
      const itemName = row.original.itemName;
      const columnSize = column.getSize(); // Get column size for dependency and debugging

      useEffect(() => {
        const element = textRef.current;
        if (!element) return;

        const checkTruncation = () => {
          // Ensure element is in layout and has dimensions
          if (element.offsetParent === null && element.offsetWidth === 0 && element.offsetHeight === 0) {
            // console.log(`Item: "${itemName}" - Element not in layout (offsetWidth is 0). Deferring or skipping.`);
            return; // Not in layout, skip or defer
          }

          const currentClientWidth = element.clientWidth;
          const currentScrollWidth = element.scrollWidth;

          // Truncation happens if scrollWidth is greater than clientWidth,
          // AND clientWidth is actually greater than 0 (meaning element is visible and has space)
          const truncated = currentScrollWidth > currentClientWidth && currentClientWidth > 0;

          // console.log(
          //   `Item: "${itemName}" (Col ID: ${column.id}, ColSize: ${columnSize}px)`,
          //   `Truncated: ${truncated}`,
          //   `ClientWidth: ${currentClientWidth}`,
          //   `ScrollWidth: ${currentScrollWidth}`
          // );

          // Only update state if it actually changed to prevent potential loops
          // and unnecessary re-renders.
          setIsTextTruncated(prevIsTruncated => {
            if (prevIsTruncated !== truncated) {
              return truncated;
            }
            return prevIsTruncated;
          });
        };

        // Initial check after a brief delay to allow layout to settle
        const initialCheckTimeoutId = setTimeout(checkTruncation, 100); // Small delay

        // Use ResizeObserver to detect size changes of the span itself
        // This is more reliable for dynamic width changes or late-settling layouts
        const observer = new ResizeObserver(() => {
          checkTruncation(); // Re-check on any resize of the observed element
        });
        observer.observe(element);

        // Cleanup
        return () => {
          clearTimeout(initialCheckTimeoutId);
          observer.unobserve(element);
          observer.disconnect(); // Important to prevent memory leaks
        };
        // Dependencies: itemName and columnSize.
        // If the itemName changes, or the column's defined size changes, re-run the effect.
      }, [ itemName, columnSize, column.id ]); // Added column.id for stability if column instance changes

      const handleOpenChange = (open: boolean) => {
        if (isTextTruncated) { // Only open if text is actually truncated
          setIsTooltipOpen(open);
        } else {
          setIsTooltipOpen(false); // Otherwise, ensure it's closed
        }
      };

      return (
        <TooltipProvider delayDuration={100}>
          <Tooltip open={isTooltipOpen} onOpenChange={handleOpenChange}>
            <TooltipTrigger asChild>
              <span
                ref={textRef}
                className={cn(
                  "block truncate", // `block` makes it take full width of parent TD, `truncate` applies ellipsis
                  isTextTruncated ? "cursor-pointer" : "cursor-default"
                )}
              // title={itemName} // Useful for debugging - see if span has content
              >
                {itemName}
              </span>
            </TooltipTrigger>
            {/* TooltipContent will only be rendered by ShadCN if Tooltip's `open` is true */}
            <TooltipContent className="bg-white border-1 border-slate-200 max-w-xl text-black text-lg text-justify">
              {itemName}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    },
    size: 350,
    maxSize: 350,
    minSize: 50,
    enableResizing: false,
    enableSorting: true,
    filterFn: stringContainsFilter,
  },
  {
    accessorKey: "itemStock",
    header: () => <div className="text-center ">Total Stock</div>, // Ensure header text is centered
    cell: ({ row }) => {
      const stockData = row.getValue("itemStock") as ItemSchemaType[ "itemStock" ];
      const stockLevel = stockData ? stockData.reduce((acc, curr) => acc + curr.currentQuantity, 0) : 0;
      // Cell content will be centered by TableCell class.
      return <p>{stockLevel}</p> // No specific styling needed here, TableCell handles it
    },
    size: 100, // Fixed size for stock numbers, adjust if needed
    enableResizing: false, // Disable manual resizing
    enableSorting: true,
    filterFn: stockLevelFilter,
    sortingFn: stockLevelSortFn
  },
  {
    accessorKey: "customerDisplayName",
    header: "Customer",
    cell: ({ row }) => {
      const customer = row.getValue("customerDisplayName") as string
      // Use truncate for ellipsis on overflow
      return <span className="block truncate">{customer}</span>
    },
    size: 180,
    minSize: 10,

    enableResizing: false, // Disable manual resizing
    enableSorting: true,
    filterFn: arrayIncludesFilter,
  },
]

export const TypeCell = ({ type }: { type: string }) => {
  // This fixed width (w-24) and inline-block are key
  const baseStyles = cn("w-24 px-2 py-1 rounded-full text-xs font-semibold text-center inline-block whitespace-nowrap",
    // type === "SINGLE" && "bg-red-500/20 text-red-700"
  )

  return (
    <span className={cn(type, baseStyles)}>{type}</span>
  )
}

