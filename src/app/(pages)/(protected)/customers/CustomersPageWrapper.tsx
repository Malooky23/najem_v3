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
import { useIsMobileTEST } from "@/hooks/use-media-query"
import { customerColumns } from "./components/columns"
import { MobileView } from "./components/mobile-view"
import { DesktopView } from "./components/desktop-view"
import { useCustomers } from "@/hooks/data-fetcher"
import { EnrichedCustomer } from "@/types/customer"
import Loading from "@/components/ui/loading"



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
  const [ selectedItem, setSelectedItem ] = useState<EnrichedCustomer | null>(null)
  const [ activeTab, setActiveTab ] = useState("all")
  const isMobile = useIsMobileTEST()

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
    // globalFilterFn: "stringContainsFilter", // Use our string contains filter for global filtering
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      pagination,
      globalFilter,
    },

    defaultColumn:{
      minSize:1
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
    // Set global filter if needed
    if (globalFilter) {
      // Global filter is already set in the state
    }
  }, [ activeFilters, activeTab, table, globalFilter ])

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
  const handleCustomerFilter = (customerDisplayName: string) => {
    setActiveFilters((prev) => {
      const customers = prev.customers.includes(customerDisplayName)
        ? prev.customers.filter((c) => c !== customerDisplayName)
        : [ ...prev.customers, customerDisplayName ]

      return {
        ...prev,
        customers,
      }
    })
  }

  // Selected items filter handler
  const handleItemSelection = (itemName: string) => {
    setActiveFilters((prev) => {
      const selectedItems = prev.selectedItems.includes(itemName)
        ? prev.selectedItems.filter((name) => name !== itemName)
        : [ ...prev.selectedItems, itemName ]

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
    setActiveTab("all")
  }

  // Refresh data
  const refreshData = () => {
    refetch();
  };

  if(isMobile){
    return(
      <MobileView
        table={table}
        globalFilter={globalFilter}
        setGlobalFilter={setGlobalFilter}
        activeFilters={activeFilters}
        handleTypeFilter={handleTypeFilter}
        handleCustomerFilter={handleCustomerFilter}
        handleItemSelection={handleItemSelection}
        clearAllFilters={clearAllFilters}
        availableItemTypes={[ "INDIVIDUAL", "BUSINESS" ]}
        availableCustomers={availableCustomers}
        selectedItem={selectedItem}
        setSelectedItem={setSelectedItem}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        refreshData={refreshData}
        data={data}
        isLoading={isLoading}

      />
    )
  }
  if(!isMobile){
    return(
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


  return (
    <Loading/>
  )
}
