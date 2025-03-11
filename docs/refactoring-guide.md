# Project Refactoring Guide

This document provides guidelines for refactoring the Najem v3 project to improve code organization, maintainability, and performance.

## Table of Contents

1. [File & Directory Structure](#file--directory-structure)
2. [Component Organization](#component-organization)
3. [State Management](#state-management)
4. [Data Fetching](#data-fetching)
5. [Code Style & Conventions](#code-style--conventions)
6. [Server & Client Components](#server--client-components)
7. [Optimization Strategies](#optimization-strategies)
8. [Refactoring Process](#refactoring-process)

## File & Directory Structure

### Standard Directory Layout

```
src/
├── app/                    # Next.js App Router pages
│   ├── (auth)/             # Auth-related routes
│   ├── (marketing)/        # Public/landing pages
│   └── (dashboard)/        # Protected dashboard routes
│       ├── customers/      # Customer management
│       └── warehouse/      # Warehouse management
│           ├── items/      # Items management 
│           ├── orders/     # Orders management
│           └── movements/  # Stock movements (renamed from tx)
├── components/             # Shared components
│   ├── ui/                 # Base UI components
│   ├── forms/              # Form-related components
│   ├── layout/             # Layout components
│   └── features/           # Shared feature components
├── hooks/                  # Custom React hooks
│   ├── form/               # Form-related hooks
│   ├── data/               # Data fetching hooks
│   ├── ui/                 # UI-related hooks
│   └── auth/               # Auth-related hooks
├── lib/                    # Utility functions & configs
├── server/                 # Server-side code
├── stores/                 # Client-side state management
└── types/                  # TypeScript type definitions
```

### Feature Module Structure

For each major feature (e.g., orders, customers), follow this structure:

```
feature/
├── page.tsx                # Server Component page
├── [id]/                   # Detail page route
│   └── page.tsx            # Detail page (server component)
├── actions.ts              # Server actions
├── components/             # Feature-specific components
│   ├── FeatureClient.tsx   # Client wrapper
│   ├── FeatureProvider.tsx # Context provider
│   ├── FeatureList/        # List view components
│   └── FeatureDetail/      # Detail view components
└── hooks/                  # Feature-specific hooks
```

## Component Organization

### Component Types

1. **Server Components**: 
   - Used for data fetching and initial rendering
   - Located in page.tsx files or server-only components
   - No "use client" directive

2. **Client Components**:
   - Used for interactivity and state management
   - Should have "use client" directive at the top
   - Organized by responsibility

3. **Component Guidelines**:
   - Single responsibility principle
   - Maximum 200-300 lines per component
   - Props should be well-defined with TypeScript interfaces
   - Use composition over inheritance

### Component Hierarchy

```
Page (Server Component)
└── FeatureClient (Client Component)
    ├── FeatureProvider (Context Provider)
    │   ├── FeatureHeader
    │   ├── FeatureFilters
    │   └── FeatureContent
    │       ├── FeatureList
    │       └── FeatureDetail
    └── UI Components (buttons, modals, etc.)
```

## State Management

### Local State

- Use `useState` for component-specific state
- Avoid deeply nested state objects
- Use reducers (`useReducer`) for complex state logic

### Context API

- Create context for feature-specific state
- Place context in feature directory
- Provide clear typing for context values
- Use dedicated provider components

Example:
```tsx
// OrdersContext.tsx
export const OrdersContext = createContext<OrdersContextType | null>(null);

export function OrdersProvider({ children }: { children: React.ReactNode }) {
  // State and functions
  
  return (
    <OrdersContext.Provider value={value}>
      {children}
    </OrdersContext.Provider>
  );
}

export function useOrders() {
  const context = useContext(OrdersContext);
  if (!context) {
    throw new Error('useOrders must be used within OrdersProvider');
  }
  return context;
}
```

### Global State

- Use Zustand for global UI state
- Each store should have a clear domain boundary
- Follow consistent patterns for actions

Example:
```tsx
// stores/orders-store.ts
export const useOrdersStore = create<OrdersStore>((set) => ({
  filters: {},
  setFilters: (filters) => set({ filters }),
  // Other state and actions
}));
```

### URL State

- Use URL parameters only for:
  - Page navigation
  - Filters that should be shareable
  - Sorting and pagination

## Data Fetching

### Server Actions

- Place in feature directory or server/actions
- Follow a consistent response format
- Implement proper error handling
- Use Zod for validation

### React Query

- Use standard patterns for queries and mutations
- Implement proper cache invalidation
- Set appropriate stale times
- Use suspense for loading states where appropriate

Example:
```tsx
// hooks/data/useOrders.ts
export function useOrders(params: OrdersQueryParams) {
  return useQuery({
    queryKey: ['orders', params],
    queryFn: () => getOrders(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
```

## Code Style & Conventions

### Naming Conventions

- **Files**:
  - Components: PascalCase.tsx (OrderCard.tsx)
  - Hooks: camelCase.ts (useOrderForm.ts)
  - Utilities: kebab-case.ts (date-utils.ts)

- **Components**:
  - React components: PascalCase (OrderDetail)
  - Component props: ComponentNameProps
  - Contexts: FeatureNameContext

- **Functions & Variables**:
  - Functions: camelCase (fetchOrderData)
  - Constants: UPPER_CASE
  - Boolean variables: hasFeature, isLoading

### TypeScript Usage

- Use explicit typing for function parameters and returns
- Define interfaces and types in dedicated files
- Use Zod for runtime validation
- Avoid `any` types

### Component Patterns

- Use destructuring for props
- Implement proper error boundaries
- Use fragment shorthand (`<>...</>`) instead of `<Fragment>`
- Follow functional component pattern

## Server & Client Components

### Server Components

- Use for:
  - Initial data fetching
  - SEO optimization
  - Static content
  - Layout structure

- Guidelines:
  - Don't use hooks or event handlers
  - Don't pass non-serializable props to client components
  - Use async/await for data fetching

### Client Components

- Use for:
  - Interactive elements
  - State management
  - Event handling
  - Form inputs
  - Animation

- Guidelines:
  - Add "use client" directive at the top
  - Keep client components small and focused
  - Implement proper memoization
  - Avoid unnecessarily converting server components to client components

### Boundaries

- Create clear boundaries between server and client components
- Use wrapper pattern to isolate client functionality
- Pass data from server to client components as props

## Optimization Strategies

### Component Optimization

- Use `memo` for expensive components
- Implement proper dependency arrays for hooks
- Use `useMemo` and `useCallback` for expensive calculations and callbacks
- Avoid unnecessary re-renders

### Data Fetching Optimization

- Implement proper caching strategies
- Use parallel data fetching where possible
- Implement suspense for loading states
- Add error boundaries for error handling

### Bundle Optimization

- Use dynamic imports for large components
- Implement code splitting
- Keep client-side code minimal

## Refactoring Process

### Step 1: Directory Structure

1. Create the new directory structure
2. Move files to their appropriate locations
3. Update imports to reflect new structure

### Step 2: Component Organization

1. Identify large components for refactoring
2. Split into smaller, focused components
3. Implement proper context providers
4. Follow the component hierarchy guidelines

### Step 3: State Management

1. Convert from prop drilling to context
2. Implement appropriate Zustand stores
3. Refactor URL state management

### Step 4: Data Fetching

1. Standardize server actions
2. Implement React Query patterns
3. Add proper error handling and loading states

### Step 5: Server/Client Optimization

1. Convert appropriate components to server components
2. Establish clear server/client boundaries
3. Implement streaming and suspense

### Step 6: Testing & Documentation

1. Add unit tests for core components
2. Document patterns and standards
3. Create example implementations

## Example Implementation

### Before

```tsx
// warehouse/orders/page.tsx (Client Component)
'use client';

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({});
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  
  useEffect(() => {
    async function fetchOrders() {
      try {
        setLoading(true);
        const data = await getOrders(filters);
        setOrders(data);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    }
    
    fetchOrders();
  }, [filters]);
  
  // Rest of component with multiple responsibilities
}
```

### After

```tsx
// warehouse/orders/page.tsx (Server Component)
export default async function OrdersPage({ 
  searchParams 
}: { 
  searchParams: { [key: string]: string | undefined } 
}) {
  // Convert search params to filter object
  const filters = parseSearchParams(searchParams);
  
  // Fetch initial data on server
  const initialData = await getOrders(filters);
  
  return (
    <OrdersClient initialData={initialData} initialFilters={filters} />
  );
}

// warehouse/orders/components/OrdersClient.tsx
'use client';

export function OrdersClient({ 
  initialData, 
  initialFilters 
}: OrdersClientProps) {
  return (
    <OrdersProvider initialData={initialData} initialFilters={initialFilters}>
      <div className="p-4 space-y-4">
        <OrdersHeader />
        <OrdersFilters />
        <OrdersList />
        <OrderDetail />
      </div>
    </OrdersProvider>
  );
}

// warehouse/orders/components/OrdersProvider.tsx
'use client';

export function OrdersProvider({ 
  children, 
  initialData, 
  initialFilters 
}: OrdersProviderProps) {
  // State management
  
  return (
    <OrdersContext.Provider value={value}>
      {children}
    </OrdersContext.Provider>
  );
}
```

By following this guide, you'll create a more maintainable, performant, and consistent codebase.