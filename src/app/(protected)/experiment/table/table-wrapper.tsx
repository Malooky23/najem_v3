'use client'

import { DataTable } from "./data-table"
import { columns } from "./columns"
import { useCustomers } from "@/hooks/data-fetcher"
import { Skeleton } from "@/components/ui/skeleton"
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

function LoadingState() {
  return (
    <div className="space-y-3">
      <div className="rounded-md border">
        <div className="p-4 space-y-4">
          {Array.from({ length: 50 }).map((_, i) => (
            <Skeleton key={i} className="h-4 w-full" />
          ))}
        </div>
      </div>
    </div>
  );
}