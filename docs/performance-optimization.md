# Performance Optimization Analysis

## Current Implementation Analysis

### Data Fetching Layer
- Using TanStack Query (React Query) for data management
- Implements stale time and cache configurations
- Uses `keepPreviousData` for smooth pagination transitions
- Server actions for data fetching

### Component Structure
- Client-side page component with multiple child components
- Complex state management for filters, sorting, and pagination
- Heavy reliance on URL parameters for state management
- Nested component structure with potential re-render cascades

### Identified Performance Issues

1. **Unnecessary Re-renders**
   - The main page component re-renders on every URL parameter change
   - Child components may re-render unnecessarily due to prop changes
   - State updates in parent components trigger re-renders in all children

2. **Data Fetching Optimization Gaps**
   - Multiple simultaneous data fetches on component mount
   - Potential waterfall requests
   - Large data sets being transferred

3. **State Management Concerns**
   - URL-based state management causes full page re-renders
   - Complex state synchronization between URL and local state
   - Redundant state tracking

## Recommendations

### 1. Component Structure Optimization

```tsx
// Current Structure
StockMovementPage
  ├── SearchBar
  ├── StockMovementTable
  │   └── DataTable
  └── OrderDetails

// Recommended Structure
StockMovementPage (Server Component)
  ├── SearchBarWrapper (Client Component)
  │   └── SearchBar
  ├── StockMovementTableWrapper (Client Component)
  │   └── StockMovementTable
  └── OrderDetailsWrapper (Client Component)
      └── OrderDetails
```

### 2. Data Fetching Improvements

```typescript
// Optimize data fetching hooks
export function useStockMovements(params: StockMovementsQueryParams = {}) {  
  return useQuery<StockMovementsQueryResult>({
    queryKey: ['stockMovements', params],
    queryFn: async () => {
      const result = await getStockMovements(
        params.page || 1,
        params.pageSize || 10,
        params.filters || {},
        params.sort || { field: 'createdAt', direction: 'desc' }
      );
      
      return result;
    },
    staleTime: 5 * 60 * 1000, // Reduce from 60 minutes to 5 minutes
    gcTime: 10 * 60 * 1000,   // Add garbage collection time
    placeholderData: keepPreviousData,
    select: (data) => ({      // Transform data at query level
      data: data.data.data,
      pagination: data.data.pagination
    })
  });
}
```

### 3. State Management Optimization

```typescript
// Implement context for shared state
export const StockMovementContext = createContext<{
  filters: StockMovementFilters;
  setFilters: (filters: StockMovementFilters) => void;
  sort: StockMovementSort;
  setSort: (sort: StockMovementSort) => void;
}>({});

// Use context in child components
export function StockMovementTableWrapper() {
  const { sort, setSort } = useContext(StockMovementContext);
  
  return (
    <StockMovementTable
      onSort={(field, direction) => setSort({ field, direction })}
      // ... other props
    />
  );
}
```

### 4. Memoization and Code Splitting

```typescript
// Memoize expensive computations and components
const visibleColumns = useMemo(() => {
  // ... column computation
}, [sortField, sortDirection]); // Remove unnecessary dependencies

// Implement dynamic imports for large components
const OrderDetails = dynamic(() => import('./OrderDetails'), {
  loading: () => <LoadingSpinner />,
  ssr: false
});
```

### 5. Implementation Example

Here's how the optimized page component should be structured:

```typescript
// StockMovementPage.tsx
import { Suspense } from 'react';
import { StockMovementProvider } from './context';
import { SearchBarWrapper } from './components/SearchBarWrapper';
import { StockMovementTableWrapper } from './components/StockMovementTableWrapper';
import { OrderDetailsWrapper } from './components/OrderDetailsWrapper';

// Server Component
export default async function StockMovementPage({ 
  searchParams 
}: { 
  searchParams: { [key: string]: string | string[] | undefined } 
}) {
  // Initial data fetch on server
  const initialData = await getInitialStockMovements(searchParams);

  return (
    <StockMovementProvider initialData={initialData}>
      <div className="px-4 h-[calc(100vh-3rem)] flex flex-col">
        <Suspense fallback={<SearchBarSkeleton />}>
          <SearchBarWrapper />
        </Suspense>
        
        <div className="flex gap-4 flex-1 min-h-0 overflow-hidden mt-0">
          <Suspense fallback={<TableSkeleton />}>
            <StockMovementTableWrapper />
          </Suspense>
          
          <Suspense fallback={<DetailsSkeleton />}>
            <OrderDetailsWrapper />
          </Suspense>
        </div>
      </div>
    </StockMovementProvider>
  );
}

// context.tsx
export const StockMovementProvider = ({ 
  children, 
  initialData 
}: PropsWithChildren<{ initialData: InitialData }>) => {
  const [filters, setFilters] = useState<StockMovementFilters>({});
  const [sort, setSort] = useState<StockMovementSort>({
    field: 'createdAt',
    direction: 'desc'
  });

  return (
    <StockMovementContext.Provider value={{
      filters,
      setFilters,
      sort,
      setSort,
      initialData
    }}>
      {children}
    </StockMovementContext.Provider>
  );
};

// SearchBarWrapper.tsx
export function SearchBarWrapper() {
  const { filters, setFilters } = useContext(StockMovementContext);
  
  return (
    <div className="flex justify-between mt-2">
      <h1 className="text-2xl font-bold text-gray-900 text-nowrap pr-2">
        Item Movements
      </h1>
      <SearchBar 
        filters={filters}
        onFilterChange={setFilters}
      />
    </div>
  );
}
```

### 6. Implementation Steps

1. **Server Components Migration**
   - Convert the page component to a Server Component
   - Create client-side wrappers for interactive components
   - Move data fetching to server components where possible

2. **State Management Refactor**
   - Implement context for shared state
   - Remove URL-based state management where unnecessary
   - Use local state for UI-only concerns

3. **Data Fetching Optimization**
   - Implement proper cache invalidation strategies
   - Add error boundaries for better error handling
   - Optimize query configurations

4. **Component Optimization**
   - Add proper memoization
   - Implement code splitting
   - Add Suspense boundaries

## Expected Benefits

1. **Reduced Bundle Size**
   - Smaller initial JavaScript payload
   - Better code splitting
   - Optimized component tree

2. **Improved Performance**
   - Fewer re-renders
   - Faster initial page load
   - Better caching

3. **Better User Experience**
   - Smoother transitions
   - More responsive UI
   - Better error handling

4. **Maintainability**
   - Clearer component boundaries
   - Better state management
   - More predictable data flow

## Monitoring and Metrics

To validate these optimizations:

1. Implement performance monitoring using Next.js Analytics or custom solutions
2. Track key metrics:
   - Time to First Byte (TTFB)
   - First Contentful Paint (FCP)
   - Time to Interactive (TTI)
   - Number of re-renders
   - Bundle size
3. Use React DevTools Profiler to measure component render times
4. Monitor network requests and cache hit rates

## Next Steps

1. Create new component files following the optimized structure
2. Implement the StockMovementContext
3. Convert the page to a Server Component
4. Add proper error boundaries and loading states
5. Implement performance monitoring
6. Test and validate improvements
7. Document performance gains

## Migration Strategy

1. **Phase 1: State Management**
   - Implement context
   - Migrate state from URL to context
   - Add proper state persistence

2. **Phase 2: Server Components**
   - Create new server component structure
   - Implement streaming and suspense
   - Add proper loading states

3. **Phase 3: Optimization**
   - Add memoization
   - Implement code splitting
   - Optimize data fetching

4. **Phase 4: Monitoring**
   - Add performance metrics
   - Implement monitoring
   - Document improvements