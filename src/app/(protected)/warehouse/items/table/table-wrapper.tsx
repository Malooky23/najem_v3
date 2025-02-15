'use client'

import { ItemsTable } from "./items-table"
import { columns } from "./columns"
import { useCustomers, useItems } from "@/hooks/data-fetcher"
import { Skeleton } from "@/components/ui/skeleton"
import type { EnrichedCustomer } from "@/types/customer"
import type { Item } from "@/server/db/schema"
import { z } from "zod"




export async function TableWrapper() {
  const { data, isLoading, isError, } = useItems()

  if(isLoading) return (<div>Loading...</div>)
  if(isError) return (<div>isError...</div>)


  return(
    <div>
      <pre>
        {JSON.stringify(data, null, 2)}
      </pre>
    </div>
  )

  // if (isLoading) return <ItemsTable columns={columns} data={generateFakeLoadingData(50)} isLoading={true} />
  // if (!data) return <div>No Data Found</div>

  // return <ItemsTable columns={columns} data={data} isLoading={false} />
}

