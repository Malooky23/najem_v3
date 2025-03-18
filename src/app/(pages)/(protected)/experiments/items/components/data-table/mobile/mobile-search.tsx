"use client"

import type { Table } from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, ChevronRight } from "lucide-react"
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet"
import type { ItemSchemaType } from "@/types/items"
interface MobileSearchProps {
  globalFilter: string
  setGlobalFilter: (value: string) => void
  table: Table<ItemSchemaType>
  handleRowClick: (item: ItemSchemaType) => void
}

export function MobileSearch({ globalFilter, setGlobalFilter, table, handleRowClick }: MobileSearchProps) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <span id="search-trigger-target" className="hidden" />
      </SheetTrigger>
      <SheetContent side="top" className="w-full">
        <SheetHeader className="mb-4">
          <SheetTitle>Search Items</SheetTitle>
        </SheetHeader>
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, ID, or type..."
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="pl-8"
            autoFocus
          />
        </div>
        {globalFilter && (
          <div className="mt-4">
            <h4 className="text-sm font-medium mb-2">Search Results</h4>
            <div className="space-y-2">
              {table.getFilteredRowModel().rows.length > 0 ? (
                table
                  .getFilteredRowModel()
                  .rows.slice(0, 5)
                  .map((row) => (
                    <div
                      key={row.id}
                      className="flex items-center justify-between p-2 border rounded-md"
                      onClick={() => {
                        handleRowClick(row.original)
                        // document.querySelector("[data-sheet-close]")?.click()
                      }}
                    >
                      <div>
                        <p className="font-medium">{row.original.itemName}</p>
                        <p className="text-sm text-muted-foreground">#{row.original.itemNumber}</p>
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                  ))
              ) : (
                <p className="text-muted-foreground">No results found</p>
              )}
            </div>
          </div>
        )}
        <SheetFooter className="mt-4">
          <SheetClose asChild>
            <Button variant="outline" className="w-full">
              Close
            </Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}

