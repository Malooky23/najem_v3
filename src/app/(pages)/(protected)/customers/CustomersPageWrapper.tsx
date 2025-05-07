"use client"

import { useState, useEffect } from "react"
import {
  type ColumnFiltersState,
  type SortingState,
  type VisibilityState,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  FilterFn,
} from "@tanstack/react-table"
import { CustomerFilterState } from "@/types/customer"
// import { useIsMobileTEST } from "@/hooks/use-media-query" // Removed: No longer needed
import { customerColumns } from "./components/columns"
// import { MobileView } from "./components/mobile-view" // Removed: MobileView is being deprecated
import { DesktopView } from "./components/desktop-view"
import { useCustomers } from "@/hooks/data-fetcher"
import { EnrichedCustomer } from "@/types/customer"
// import Loading from "@/components/ui/loading" // Removed: DesktopView handles its own loading state or this will be handled differently

export default function CustomersPageWrapper() {
  const [ sorting, setSorting ] = useState<SortingState>([])
  const [ columnFilters, setColumnFilters ] = useState<ColumnFiltersState>([])
  const [ columnVisibility, setColumnVisibility ] = useState<VisibilityState>({})
  const [ globalFilter, setGlobalFilter ] = useState("")
  const [ rowSelection, setRowSelection ] = useState({})
  const [ pagination, setPagination ] = useState({
    pageIndex: 0,
    pageSize: 20,
  })
  const [ activeFilters, setActiveFilters ] = useState<CustomerFilterState>({
    types: [],
    customers: [],
    selectedItems: [],
  })
  // const [ selectedItem, setSelectedItem ] = useState<EnrichedCustomer | null>(null) // Removed: Was for MobileView
  // const [ activeTab, setActiveTab ] = useState("all") // Removed: Was for MobileView
  // const isMobile = useIsMobileTEST() // Removed: No longer needed

  const { data: customerData, isLoading, status, error, refetch } = useCustomers();
  const [ data, setData ] = useState<EnrichedCustomer[]>([]);
  const [ availableCustomers, setAvailableCustomers ] = useState<string[]>([]);


  useEffect(() => {
    if (customerData) {
      setData(customerData);
      setAvailableCustomers(customerData.map(customer => customer.displayName));

    }
  }, [ customerData ]);

  // Custom filter functions with proper implementation
  const arrayIncludesFilter: FilterFn<EnrichedCustomer> = (row, columnId, filterValue) => {
    // Return true for empty filters
    if (!filterValue || !Array.isArray(filterValue) || filterValue.length === 0) return true

    // Get the value from the row
    const value = row.getValue(columnId)

    // Return true if ANY of the filter values exactly match the cell value
    return filterValue.includes(value)
  }

  const stringContainsFilter: FilterFn<EnrichedCustomer> = (row, columnId, filterValue) => {
    // Return true for empty filters
    if (filterValue === undefined || filterValue === '') return true

    // Get the value and convert to lowercase string
    const value = String(row.getValue(columnId)).toLowerCase()

    // Check if value contains the filterValue
    return value.includes(String(filterValue).toLowerCase())
  }

  const table = useReactTable({
    data,
    columns: customerColumns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onPaginationChange: setPagination,
    globalFilterFn: stringContainsFilter, // Use our string contains filter for global filtering
    filterFns: {
      arrayIncludes: arrayIncludesFilter,
      stringContains: stringContainsFilter,
    },
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      pagination,
      globalFilter,
    },

    defaultColumn: {
      minSize: 1
    }

  })

  // Apply custom filters
  useEffect(() => {
    // Clear existing filters first
    table.resetColumnFilters()

    // Apply type filters
    if (activeFilters.types.length > 0) {
      table.getColumn("customerType")?.setFilterValue(activeFilters.types)
    }
    if (activeFilters.customers.length > 0) {
      table.getColumn("displayName")?.setFilterValue(activeFilters.customers)
    }
    // Set global filter if needed
    if (globalFilter) {
      // Global filter is already set in the state
    }
  }, [ activeFilters, table, globalFilter ]) // Removed activeTab from dependencies

  // Type filter handlers
  const handleTypeFilter = (type: string) => {
    setActiveFilters((prev) => {
      const types = prev.types.includes(type) ? prev.types.filter((t) => t !== type) : [ ...prev.types, type ]

      return {
        ...prev,
        types,
      }
    })
  }

  // Customer filter handlers
  const handleCustomerFilter = (displayName: string) => {
    setActiveFilters((prev) => {
      const customers = prev.customers.includes(displayName)
        ? prev.customers.filter((c) => c !== displayName)
        : [ ...prev.customers, displayName ]

      return {
        ...prev,
        customers,
      }
    })
  }

  // Selected items filter handler
  const handleItemSelection = (displayName: string) => {
    setActiveFilters((prev) => {
      const selectedItems = prev.selectedItems.includes(displayName)
        ? prev.selectedItems.filter((name) => name !== displayName)
        : [ ...prev.selectedItems, displayName ]

      return {
        ...prev,
        selectedItems,
      }
    })
  }

  // Clear all filters
  const clearAllFilters = () => {
    setActiveFilters({
      types: [],
      customers: [],
      selectedItems: [],
    })
    setGlobalFilter("")
    // setActiveTab("all") // Removed: Was for MobileView
  }

  // Refresh data
  const refreshData = () => {
    refetch();
  };

  return (
    <DesktopView
      table={table}
      isLoading={isLoading}
      status={status}
      globalFilter={globalFilter}
      setGlobalFilter={setGlobalFilter}
      activeFilters={activeFilters}
      handleTypeFilter={handleTypeFilter}
      handleCustomerFilter={handleCustomerFilter}
      handleItemSelection={handleItemSelection}
      clearAllFilters={clearAllFilters}
      availableItemTypes={[ "INDIVIDUAL", "BUSINESS" ]}
      availableCustomers={availableCustomers}
      data={data}
      refetch={refreshData}
    />
  )
}
