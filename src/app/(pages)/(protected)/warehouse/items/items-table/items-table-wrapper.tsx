'use client'

import { ItemsTable } from "./items-table"
import { itemsColumns } from "./items-columns"
import { useCustomers, useItems } from "@/hooks/data-fetcher"
import { EnrichedItemsType } from "@/types/items"




export function TableWrapper() {
  // const { data, isLoading, isError, } = useItems()



  const { data: customers, isSuccess: isCustomersSuccess, isLoading: isCustomersLoading, isError: isCustomersError } = useCustomers();
  const { data: items, isSuccess: isItemsSuccess, isLoading: isItemsLoading, isError: isItemsError } = useItems();

  // Transform items to include customerName
  const itemsWithCustomerNames =
    isItemsSuccess && isCustomersSuccess && customers && items
      ? items.map((item) => {
        const customer = customers.find(
          (customer) => customer.customerId === item.customerId,
        );
        return {
          ...item,
          customerDisplayName: customer ? customer.displayName : 'Unknown Customer', // Handle case where customer might not be found
        } as EnrichedItemsType
      })
      : [];

  if (isCustomersLoading || isItemsLoading) return (<div>Loading...</div>)
  if (isItemsError) return (<div>Error Loading Items</div>)
  if (isCustomersError) return (<div>Error Loading Customers</div>)

  // if (!isCustomersSuccess || !isItemsSuccess) {
  //   return <p>Loading data...</p>; // Or handle loading state appropriately
  // }


  return (
    <ItemsTable data={itemsWithCustomerNames} columns={itemsColumns} isLoading={false} />

  )

  // if (isLoading) return <ItemsTable columns={columns} data={generateFakeLoadingData(50)} isLoading={true} />
  // if (!data) return <div>No Data Found</div>

  // return <ItemsTable columns={columns} data={data} isLoading={false} />
}

