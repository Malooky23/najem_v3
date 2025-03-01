'use client'
import {  useStockMovements } from '@/hooks/data-fetcher'

export default function TestPage(){
 const {data, isLoading, error} = useStockMovements()

 if (isLoading) {
  return <div>Loading customers...</div>;
}

if (error) {
  return <div>Error loading customers: {error.message}</div>;
}

if (!data) { // Important to check if customers is null or undefined
  return <div>No customers found.</div>; // Or handle this case appropriately
}
  return (
    <div>
      <pre>
        {JSON.stringify(data,null,2)}
      </pre>
    </div>
  )
}