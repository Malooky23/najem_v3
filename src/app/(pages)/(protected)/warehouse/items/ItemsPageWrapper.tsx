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
import { FilterState, ItemSchemaType } from "@/types/items"
import { useIsMobileTEST } from "@/hooks/use-media-query"
import { useItemsQuery } from "@/hooks/data/useItems"
import { itemColumns } from "./components/columns"
import { MobileView } from "./components/mobile-view"
import { DesktopView } from "./components/desktop-view"



export default function ItemsPageWrapper() {
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [globalFilter, setGlobalFilter] = useState("")
  const [rowSelection, setRowSelection] = useState({})
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 20,
  })
  const [activeFilters, setActiveFilters] = useState<FilterState>({
    types: [],
    customers: [],
    selectedItems: [],
  })
  const [selectedItem, setSelectedItem] = useState<ItemSchemaType | null>(null)
  const [activeTab, setActiveTab] = useState("all")
  const isMobile = useIsMobileTEST()

  const { data: itemsData, isLoading, status, error, refetch } = useItemsQuery();
    const [data, setData] = useState<ItemSchemaType[]>([]);

    useEffect(() => {
      if (itemsData) {
        setData(itemsData);
      }
    }, [itemsData]);

  // Custom filter functions with proper implementation
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
    const stockData = row.getValue(columnId) as ItemSchemaType["itemStock"]
    
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

  const table = useReactTable({
    data,
    columns: itemColumns,
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
      stockLevel: stockLevelFilter,
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
  })

  // Apply custom filters
  useEffect(() => {
    // Clear existing filters first
    table.resetColumnFilters()

    // Apply type filters
    if (activeFilters.types.length > 0) {
      table.getColumn("itemType")?.setFilterValue(activeFilters.types)
    }

    // Apply customer filters
    if (activeFilters.customers.length > 0) {
      table.getColumn("customerDisplayName")?.setFilterValue(activeFilters.customers)
    }

    // Apply selected items filter
    if (activeFilters.selectedItems.length > 0) {
      table.getColumn("itemName")?.setFilterValue(activeFilters.selectedItems)
    }

    // Apply tab filters - handle tabs properly
    if (activeTab === "out-of-stock" || activeTab === "low-stock") {
      table.getColumn("itemStock")?.setFilterValue(activeTab)
    } else if (activeTab !== "all") {
      // For itemType tabs, set a single value filter
      table.getColumn("itemType")?.setFilterValue([activeTab])
    }
    
    // Set global filter if needed
    if (globalFilter) {
      // Global filter is already set in the state
    }
  }, [activeFilters, activeTab, table, globalFilter])

  // Type filter handlers
  const handleTypeFilter = (type: string) => {
    setActiveFilters((prev) => {
      const types = prev.types.includes(type) ? prev.types.filter((t) => t !== type) : [...prev.types, type]

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
        : [...prev.customers, customerDisplayName]

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
        : [...prev.selectedItems, itemName]

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

  // Get all available item types from data
    const availableItemTypes = Array.from(new Set(data.map((item) => item.itemType))).filter(Boolean) as string[];

  // Get all available customers from data
  const availableCustomers = Array.from(new Set(data.map((item) => item.customerDisplayName))).filter(Boolean) as string[];

  return isMobile ? (
    <MobileView
      table={table}
      globalFilter={globalFilter}
      setGlobalFilter={setGlobalFilter}
      activeFilters={activeFilters}
      handleTypeFilter={handleTypeFilter}
      handleCustomerFilter={handleCustomerFilter}
      handleItemSelection={handleItemSelection}
      clearAllFilters={clearAllFilters}
      availableItemTypes={availableItemTypes}
      availableCustomers={availableCustomers}
      selectedItem={selectedItem}
      setSelectedItem={setSelectedItem}
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      refreshData={refreshData}
      data={data}
    />
  ) : (
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
      availableItemTypes={availableItemTypes}
      availableCustomers={availableCustomers}
      data={data}
      refetch={refreshData}

    />
  )
}
