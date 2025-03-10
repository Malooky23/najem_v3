# Items/TX Page Overview

## Architecture Overview

The items/tx page is a Next.js application page that displays and manages stock movements. It follows a modern React architecture with:

- Next.js 14 App Router
- Client-side state management with Zustand
- Server-side data fetching
- URL-based state persistence
- Responsive design with Tailwind CSS

## Core Components

### Page Structure
- `page.tsx`: Entry point using Next.js App Router
- `StockMovementPage.tsx`: Main page component with layout management
  - Uses CSS Grid for responsive layout
  - Handles mobile/desktop view switching
  - Manages loading states

### State Management
- `stock-movement-store.ts`: Zustand store for state management
  - Handles pagination
  - Manages sorting
  - Controls filters
  - Maintains UI state (details panel, loading)

### Components

1. **Search Panel** (`SearchPanel.tsx`)
   - Debounced search inputs
   - Movement type filtering
   - Date range selection
   - Customer and item name filtering
   - Uses Tailwind for styling
   - Responsive design with collapsible filters

2. **Movements Table** (`MovementsTable.tsx`, `table/`)
   - Data display with sorting
   - Row selection
   - Pagination controls
   - Uses TanStack Table (React Table)
   - Custom column definitions
   - Loading states and error handling

3. **Details Panel** (`details/DetailsPanel.tsx`)
   - Slide-in panel for movement details
   - Responsive design
   - Conditional rendering based on selection

### API Integration

1. **Stock Movements API** (`api/stock-movements/route.ts`)
   - Next.js API route
   - Handles:
     - Pagination
     - Filtering
     - Sorting
     - Authentication
   - Returns standardized response format

2. **Data Fetching**
   - Custom hooks for data fetching
   - Server actions for database operations
   - Error handling and loading states

## Technologies Used

1. **Frontend Framework**
   - Next.js 14
   - React (Server Components)
   - TypeScript

2. **State Management**
   - Zustand
   - URL state synchronization
   - React hooks

3. **Styling**
   - Tailwind CSS
   - CSS Modules for component-specific styles
   - Lucide icons

4. **Data Management**
   - TanStack Table
   - Custom hooks for data fetching
   - Debounced inputs

5. **UI Components**
   - Shadcn UI components
   - Custom form controls
   - Responsive design primitives

## Features

1. **Search and Filtering**
   - Real-time search with debounce
   - Multiple filter types
   - Date range selection
   - Movement type filtering

2. **Data Display**
   - Sortable columns
   - Pagination
   - Row selection
   - Loading states
   - Error handling

3. **URL Integration**
   - State persistence in URL
   - Shareable filtered views
   - Browser history support

4. **Responsive Design**
   - Mobile-first approach
   - Adaptive layouts
   - Touch-friendly interactions

## File Structure

```
src/app/(pages)/(protected)/warehouse/tx/
├── page.tsx
├── components/
│   ├── StockMovementPage.tsx
│   ├── SearchPanel.tsx
│   ├── MovementsTable.tsx
│   ├── details/
│   │   └── DetailsPanel.tsx
│   └── table/
│       ├── table.tsx
│       └── columns.tsx
```

## Performance Optimizations

1. **Data Loading**
   - Debounced search
   - Pagination
   - Optimistic updates

2. **Rendering**
   - Memoized components
   - Conditional rendering
   - Lazy loading for details

3. **State Management**
   - Efficient updates
   - URL-based caching
   - Minimal re-renders