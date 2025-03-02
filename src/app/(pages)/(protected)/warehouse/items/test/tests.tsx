'use client'
import { useCustomers, useStockMovements } from '@/hooks/data-fetcher'

export default function TestPage() {
  // const search = '?search=BMW'
  const { data: data, isLoading, error } = useStockMovements()

  // if (isLoading || isTestLoading) {
  //   return <div>Loading customers...</div>;
  // }

  if (error) {
    return <div>Error : {error.message}</div>;
  }


  if (!data) { // Important to check if customers is null or undefined
    return <div>No OG found.</div>; // Or handle this case appropriately
  }

  return (
    <div className="flex flex-row gap-4">
 
      {isLoading ? <div>Loading Data...</div> : (
        <pre>
          {JSON.stringify(data, null, 2)}
        </pre>
      )}

    </div>
  )
}