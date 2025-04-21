"use client"


import { useState, useEffect, ReactNode } from "react"
import { format } from "date-fns"
import { CalendarIcon, FilterXIcon } from "lucide-react"
import type { DateRange } from "react-day-picker"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ExpenseFilters, StatusType } from "@/types/expense"

export type ExpenseFilterValues = Omit<ExpenseFilters, 'search'>;


interface ExpenseFilterPanelProps {
    initialFilterValues: ExpenseFilterValues
    customerOptions?: string[]
    expenseItemOptions?: string[]
    onFilterChange: (filters: ExpenseFilterValues) => void
    onClearAll: () => void
      children?: ReactNode
    
}

// Helper to check if filters are default/empty
const areFiltersDefault = (filters: ExpenseFilterValues): boolean => {
    return (
        (filters.status === "" || filters.status === undefined) && // Check against empty string or undefined
        !filters.orderNumber &&
        !filters.dateRange?.from && // Checks if 'from' is not set
        !filters.dateRange?.to && // Checks if 'to' is not set (covers undefined range too)
        !filters.customerId &&
        !filters.expenseItemName
    )
}

export function ExpenseFilterPanel({
    initialFilterValues,
    customerOptions = [ "customerId1", "customerId2" ],
    expenseItemOptions = [ "item1", "item2" ],
    onFilterChange,
    onClearAll,
    children
}: ExpenseFilterPanelProps) {
    // Local state to manage UI responsiveness, synced with props
    // Explicitly type the status state
    const [ status, setStatus ] = useState<StatusType>(initialFilterValues.status || "")
    const [ orderNumber, setOrderNumber ] = useState(initialFilterValues.orderNumber || "")
    const [ dateRange, setDateRange ] = useState<DateRange | undefined>(initialFilterValues.dateRange)
    const [ customerId, setCustomer ] = useState(initialFilterValues.customerId || "")
    const [ expenseItemName, setExpenseItemName ] = useState(initialFilterValues.expenseItemName || "")

    // Effect to sync local state if props change externally
    useEffect(() => {
        setStatus(initialFilterValues.status || "")
        setOrderNumber(initialFilterValues.orderNumber || "")
        setDateRange(initialFilterValues.dateRange)
        setCustomer(initialFilterValues.customerId || "")
        setExpenseItemName(initialFilterValues.expenseItemName || "")
    }, [ initialFilterValues ]) // Re-run only when the initial values object changes

    // Generic handler to update a specific filter and notify parent
    const handleFilterUpdate = (updatedValues: Partial<ExpenseFilterValues>) => {
        // Construct the full new state based on current local state + updates
        const newFilters: ExpenseFilterValues = {
            status: updatedValues.status !== undefined ? updatedValues.status : status,
            orderNumber: updatedValues.orderNumber !== undefined ? updatedValues.orderNumber : orderNumber,
            dateRange: updatedValues.dateRange !== undefined ? updatedValues.dateRange : dateRange,
            customerId: updatedValues.customerId !== undefined ? updatedValues.customerId : customerId,
            expenseItemName: updatedValues.expenseItemName !== undefined ? updatedValues.expenseItemName : expenseItemName,
        }
        onFilterChange(newFilters)
    }

    // Specific handlers for each input type
    const handleStatusChange = (value: string) => {
        // The value from Select is always a string, map 'ALL' to ''
        // Cast other valid values ('PENDING', 'DONE') to StatusType
        const newStatus = value === "ALL" ? "" : (value as StatusType)
        setStatus(newStatus)
        handleFilterUpdate({ status: newStatus })
    }

    const handleOrderNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value
        setOrderNumber(newValue)
        handleFilterUpdate({ orderNumber: newValue })
    }

    const handleDateRangeChange = (newRange: DateRange | undefined) => {
        setDateRange(newRange)
        handleFilterUpdate({ dateRange: newRange })
    }

    const handleCustomerChange = (value: string) => {
        const newCustomer = value === "ALL" ? "" : value
        setCustomer(newCustomer)
        handleFilterUpdate({ customerId: newCustomer })
    }

    const handleExpenseItemChange = (value: string) => {
        const newItem = value === "ALL" ? "" : value
        setExpenseItemName(newItem)
        handleFilterUpdate({ expenseItemName: newItem })
    }

    const clearFilters = () => {
        // Reset local state
        setStatus("")
        setOrderNumber("")
        setDateRange(undefined)
        setCustomer("")
        setExpenseItemName("")

        onClearAll()

        // Notify parent with empty filters
        onFilterChange({
            status: "", // Use empty string for 'All' status
            orderNumber: "",
            dateRange: undefined,
            customerId: "",
            expenseItemName: "",
        })
    }

    // Construct the current filters object from local state for checking if clear is disabled
    // The types are now aligned thanks to useState<StatusType>
    const currentFilters: ExpenseFilterValues = {
        status, // status is already StatusType ('', 'PENDING', 'DONE')
        orderNumber,
        dateRange,
        customerId,
        expenseItemName,
    }
    const isClearDisabled = areFiltersDefault(currentFilters)

    return (
        <Popover>
            <PopoverTrigger asChild>
                {children ? children :
                <Button variant="outline" className="flex items-center gap-2">
                    <FilterXIcon className="h-4 w-4" />
                    <span>Filters</span>
                </Button>}
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 border-none" align="start">
                <div className="bg-white rounded-xl shadow-lg p-5 max-w-[95vw] w-[800px]">
                    <div className="flex items-center justify-between mb-4 border-b pb-3">
                        <h3 className="text-base font-medium">Filter Expenses</h3>
                        <Button
                            variant="ghost"
                            // onClick={}
                            onClick={clearFilters}
                            disabled={isClearDisabled}
                            size="sm"
                            className="text-muted-foreground hover:text-primary transition-colors"
                        >
                            <FilterXIcon className="mr-2 h-4 w-4" />
                            Clear All
                        </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-6">
                        {/* Status Filter */}
                        <div className="md:col-span-3">
                            <Label htmlFor="status-filter" className="text-sm font-medium mb-1.5 block">
                                Status
                            </Label>
                            <Select value={status || "ALL"} onValueChange={handleStatusChange}>
                                <SelectTrigger id="status-filter" className="w-full bg-background">
                                    <SelectValue placeholder="All Statuses" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ALL">All</SelectItem>
                                    <SelectItem value="PENDING">Pending</SelectItem>
                                    <SelectItem value="DONE">Done</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Order Number Filter */}
                        <div className="md:col-span-3">
                            <Label htmlFor="order-filter" className="text-sm font-medium mb-1.5 block">
                                Order Number
                            </Label>
                            <Input
                                id="order-filter"
                                placeholder="Enter Order #"
                                value={orderNumber}
                                onChange={handleOrderNumberChange}
                                className="w-full bg-background"
                            />
                        </div>

                        {/* Date Range Filter */}
                        <div className="md:col-span-6">
                            <Label htmlFor="date-range-filter" className="text-sm font-medium mb-1.5 block">
                                Date Range
                            </Label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        id="date-range-filter"
                                        variant="outline"
                                        className={cn(
                                            "w-full justify-start text-left font-normal bg-background",
                                            !dateRange && "text-muted-foreground",
                                        )}
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {dateRange?.from ? (
                                            dateRange.to ? (
                                                <>
                                                    {format(new Date(dateRange.from), "yyyy-MM-dd")} - {format(new Date(dateRange.to), "yyyy-MM-dd")}
                                                </>
                                            ) : (
                                                    format(dateRange.from, "yyyy-MM-dd")
                                            )
                                        ) : (
                                            <span>Pick a date range</span>
                                        )}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar
                                        initialFocus
                                        mode="range"
                                        defaultMonth={dateRange?.from}
                                        selected={dateRange}
                                        onSelect={handleDateRangeChange}
                                        numberOfMonths={2}
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>

                        {/* Customer Filter */}
                        <div className="md:col-span-6">
                            <Label htmlFor="customer-filter" className="text-sm font-medium mb-1.5 block">
                                Customer
                            </Label>
                            <Select value={customerId || "ALL"} onValueChange={handleCustomerChange}>
                                <SelectTrigger id="customer-filter" className="w-full bg-background">
                                    <SelectValue placeholder="All Customers" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ALL">All Customers</SelectItem>
                                    {customerOptions.map((cust) => (
                                        <SelectItem key={cust} value={cust}>
                                            {cust}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Expense Item Filter */}
                        <div className="md:col-span-6">
                            <Label htmlFor="item-filter" className="text-sm font-medium mb-1.5 block">
                                Expense Item
                            </Label>
                            <Select value={expenseItemName || "ALL"} onValueChange={handleExpenseItemChange}>
                                <SelectTrigger id="item-filter" className="w-full bg-background">
                                    <SelectValue placeholder="All Items" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ALL">All Items</SelectItem>
                                    {expenseItemOptions.map((item) => (
                                        <SelectItem key={item} value={item}>
                                            {item}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="mt-6 flex justify-end">
                        <Button onClick={() => onFilterChange(currentFilters)} className="px-6">
                            Apply Filters
                        </Button>
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    )
}

// Make sure to export the component as named export if that's the project convention
// export { ExpenseFilterPanel };
// If using default export, the current code is fine.
// The prompt requested named exports for *new* components,
// but modifying an existing one like this often keeps the original export style.
// Assuming default export was intended here based on the original code.
