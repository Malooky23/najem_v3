import { Suspense } from "react"
import { StockMovementProvider } from "./context/stock-movement-context"
import { SearchBarWrapper } from "./components/search/SearchBarWrapper"
import { TableWrapper } from "./components/table/TableWrapper"
import { DetailsWrapper } from "./components/details/DetailsWrapper"
import { getStockMovements } from "@/server/actions/getStockMovements"
import { LoadingSpinner } from "@/components/ui/loading-spinner"

// Mark the page as dynamic
export const dynamic = 'force-dynamic'

// Loading components
const SearchBarSkeleton = () => (
  <div className="flex justify-between mt-2 animate-pulse">
    <div className="h-8 w-48 bg-slate-200 rounded"></div>
    <div className="h-10 w-96 bg-slate-200 rounded"></div>
  </div>
)

const TableSkeleton = () => (
  <div className="flex-1 overflow-hidden flex flex-col rounded-lg bg-slate-50 border-2 border-slate-200 animate-pulse">
    <div className="h-full w-full bg-slate-200"></div>
  </div>
)

const DetailsSkeleton = () => (
  <div className="w-[60%] bg-white rounded-md border animate-pulse">
    <div className="h-[400px] bg-slate-200"></div>
  </div>
)

// Server Component
export default async function StockMovementPage({ 
  searchParams 
}: { 
  searchParams: { [key: string]: string | string[] | undefined } 
}) {
  // Get initial data on the server
  const result = await getStockMovements(
    1, // Initial page
    10, // Initial page size
    {}, // Initial filters
    { field: 'createdAt', direction: 'desc' } // Initial sort
  )

  if (!result.success || !result.data) {
    throw new Error(result.error || 'Failed to fetch initial data')
  }

  const initialData = {
    movements: result.data.data,
    pagination: result.data.pagination
  }

  return (
    <StockMovementProvider initialData={initialData}>
      <div className="px-4 h-[calc(100vh-3rem)] flex flex-col">
        <Suspense fallback={<SearchBarSkeleton />}>
          <SearchBarWrapper />
        </Suspense>
        
        <div className="flex gap-4 flex-1 min-h-0 overflow-hidden mt-0">
          <Suspense fallback={<TableSkeleton />}>
            <TableWrapper />
          </Suspense>

          <Suspense fallback={<DetailsSkeleton />}>
            <DetailsWrapper />
          </Suspense>
        </div>
      </div>
    </StockMovementProvider>
  )
}

// Error boundary
export function ErrorBoundary({ error }: { error: Error }) {
  return (
    <div className="p-4 m-6 flex justify-center items-center rounded-md border border-red-200 bg-red-50 text-red-700">
      Error loading movements: {error.message}
    </div>
  )
}

// Loading state
export function Loading() {
  return (
    <div className="h-[calc(100vh-3rem)] flex items-center justify-center">
      <LoadingSpinner />
    </div>
  )
}