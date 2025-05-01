'use client'

import { DataTable } from "./customer-data-table"
import { columns } from "./customer-columns"
import { useCustomers } from "@/hooks/data-fetcher"
import type { EnrichedCustomer } from "@/types/customer"

const generateFakeLoadingData = (count: number): EnrichedCustomer[] => {
  return Array.from({ length: count }, (_, i) => ({
    customerId: 'LOADING',
    customerNumber: i,
    customerType: 'BUSINESS',
    notes: null,
    createdAt: new Date ,
    updatedAt: null,
    individual:null,
    country: 'LOADING',
    business: {
      businessName: 'LOADING',
      isTaxRegistered: false,
      taxNumber: null,
    },
    contacts: null,
    addresses: null,
    displayName: 'LOADING'
  }))
}



export function TableWrapper() {
  const { data, isLoading } = useCustomers()

  if (isLoading) return <DataTable columns={columns} data={generateFakeLoadingData(50)} isLoading={true} />
  if (!data) return <div>No Data Found</div>

  return <DataTable columns={columns} data={data} isLoading={false} />
}

