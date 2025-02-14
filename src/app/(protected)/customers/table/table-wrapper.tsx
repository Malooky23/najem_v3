'use client'

import { DataTable } from "./data-table"
import { columns } from "./columns"
import { useCustomers } from "@/hooks/use-customers"

export function TableWrapper() {
  const { data, isLoading } = useCustomers()

  if (isLoading) return <div>Loading...</div>
  if (!data) return <div>No Data Found</div>

  return <DataTable columns={columns} data={data} />
}
