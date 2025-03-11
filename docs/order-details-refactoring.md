# Order Details Component Refactoring

## Current Issues

1. **Deeply Nested Structure**:
   - Components nested too deeply in `/warehouse/orders/components/order-details/`
   - Difficult to navigate and understand component relationships

2. **Mixed Responsibilities**:
   - Components handle UI, data fetching, state management in the same file
   - Poor separation of concerns

3. **Props Drilling**:
   - Excessive props passing between components
   - Difficult to track state changes

4. **Inconsistent Patterns**:
   - Some components use memo, others don't
   - Inconsistent error handling

5. **Commented Code and Props**:
   - Commented out props in OrderDetailsContainer.tsx
   - Unclear component API

## Refactoring Implementation Plan

### 1. Create Proper Directory Structure

```
src/
└── app/
    └── (dashboard)/
        └── warehouse/
            └── orders/
                ├── page.tsx                    # Main orders page (server component)
                ├── [id]/                       # Order detail page route
                │   └── page.tsx                # Order detail page (server component)
                ├── components/                 # Shared order components
                │   ├── OrdersClient.tsx        # Client wrapper for orders page
                │   ├── OrdersProvider.tsx      # Context provider for orders
                │   ├── OrdersList/             # List view components
                │   │   ├── OrdersTable.tsx     # Orders table component
                │   │   └── orders-columns.ts   # Column definitions
                │   └── OrderFilters/           # Filter components
                │       └── OrderFilters.tsx    # Filters UI
                └── detail/                     # Order detail components
                    ├── OrderDetailClient.tsx   # Client wrapper for detail view
                    ├── OrderDetailProvider.tsx # Context provider for detail view
                    ├── OrderHeader.tsx         # Order header with actions
                    ├── OrderInfo.tsx           # Order information card
                    ├── OrderItems.tsx          # Order items table
                    └── OrderNotes.tsx          # Order notes component
```

### 2. Create Context for State Management

```tsx
// OrderDetailContext.tsx
import { createContext, useContext, useState } from 'react';
import { EnrichedOrders, OrderStatus } from '@/types/orders';
import { useOrderDetails, useOrderStatusMutation } from '@/hooks/orders';
import { showStatusUpdateErrorToast } from '@/lib/order-status-errors';
import { toast } from '@/hooks/use-toast';

type OrderDetailContextType = {
  order: EnrichedOrders | null;
  isLoading: boolean;
  isProcessing: boolean;
  isEditing: boolean;
  setIsEditing: (value: boolean) => void;
  updateStatus: (status: OrderStatus) => void;
  saveChanges: (data: Partial<EnrichedOrders>) => Promise<void>;
};

const OrderDetailContext = createContext<OrderDetailContextType | null>(null);

export function OrderDetailProvider({ 
  children, 
  orderId,
  initialData 
}: { 
  children: React.ReactNode;
  orderId: string;
  initialData?: EnrichedOrders;
}) {
  const [isEditing, setIsEditing] = useState(false);
  
  // Fetch order details
  const { data: order, isLoading } = useOrderDetails(orderId, initialData);
  
  // Status mutation
  const statusMutation = useOrderStatusMutation();
  
  // Update status function
  const updateStatus = (status: OrderStatus) => {
    if (!orderId || !order) {
      toast({
        title: "Error",
        description: "Cannot update order: missing order data",
        variant: "destructive"
      });
      return;
    }
    
    if (order.status === status) return;
    
    statusMutation.mutate({ 
      orderId,
      status
    }, {
      onError: (error: Error) => {
        showStatusUpdateErrorToast(status, {
          message: error.message,
          code: 'UPDATE_ERROR'
        });
      },
      onSuccess: (data) => {
        if (!data || !data.success) {
          showStatusUpdateErrorToast(status, data?.error || {
            message: 'Failed to update order status'
          });
        }
      }
    });
  };
  
  // Save changes function
  const saveChanges = async (data: Partial<EnrichedOrders>) => {
    // Implementation
  };

  return (
    <OrderDetailContext.Provider value={{
      order: order || null,
      isLoading,
      isProcessing: statusMutation.isPending,
      isEditing,
      setIsEditing,
      updateStatus,
      saveChanges
    }}>
      {children}
    </OrderDetailContext.Provider>
  );
}

export function useOrderDetail() {
  const context = useContext(OrderDetailContext);
  if (!context) {
    throw new Error('useOrderDetail must be used within OrderDetailProvider');
  }
  return context;
}
```

### 3. Create Client Wrapper Component

```tsx
// OrderDetailClient.tsx
'use client';

import { useState } from 'react';
import { EnrichedOrders } from '@/types/orders';
import { OrderDetailProvider } from './OrderDetailProvider';
import { OrderHeader } from './OrderHeader';
import { OrderInfo } from './OrderInfo';
import { OrderItems } from './OrderItems';
import { OrderNotes } from './OrderNotes';
import { cn } from '@/lib/utils';

interface OrderDetailClientProps {
  orderId: string;
  initialData?: EnrichedOrders;
  onClose?: () => void;
  isMobile?: boolean;
}

export function OrderDetailClient({
  orderId,
  initialData,
  onClose,
  isMobile = false
}: OrderDetailClientProps) {
  return (
    <OrderDetailProvider orderId={orderId} initialData={initialData}>
      <div
        className={cn(
          "bg-white rounded-md border relative transition-all duration-300 flex-1 overflow-auto flex flex-col",
          isMobile ? "fixed inset-0 z-50 m-0" : "w-full"
        )}
      >
        <OrderHeader onClose={onClose} />
        
        <div className="flex-1 overflow-auto p-4 space-y-4">
          <OrderInfo />
          <OrderItems />
          <OrderNotes />
        </div>
      </div>
    </OrderDetailProvider>
  );
}
```

### 4. Individual Components with Context

```tsx
// OrderHeader.tsx
'use client';

import { useOrderDetail } from './OrderDetailProvider';
import { OrderStatus } from '@/types/orders';
import { Button } from '@/components/ui/button';
import { X, Edit, Save } from 'lucide-react';

interface OrderHeaderProps {
  onClose?: () => void;
}

export function OrderHeader({ onClose }: OrderHeaderProps) {
  const { 
    order, 
    isLoading, 
    isProcessing, 
    isEditing, 
    setIsEditing, 
    updateStatus 
  } = useOrderDetail();
  
  if (isLoading || !order) {
    return <div className="p-4 border-b">Loading...</div>;
  }
  
  return (
    <div className="p-4 border-b flex items-center justify-between">
      <div>
        <h2 className="text-xl font-semibold">
          Order #{order.orderNumber}
        </h2>
        <p className="text-sm text-muted-foreground">
          Status: {order.status}
        </p>
      </div>
      
      <div className="flex items-center gap-2">
        {isEditing ? (
          <Button 
            onClick={() => setIsEditing(false)}
            variant="outline"
          >
            <Save className="w-4 h-4 mr-2" />
            Save
          </Button>
        ) : (
          <Button 
            onClick={() => setIsEditing(true)}
            variant="outline"
          >
            <Edit className="w-4 h-4 mr-2" />
            Edit
          </Button>
        )}
        
        {onClose && (
          <Button 
            onClick={onClose}
            variant="ghost"
            size="icon"
          >
            <X className="w-5 h-5" />
          </Button>
        )}
      </div>
    </div>
  );
}
```

### 5. Organizing Hooks

```tsx
// src/hooks/orders/index.ts
export * from './useOrderDetails';
export * from './useOrderStatus';
export * from './useOrderForm';

// src/hooks/orders/useOrderDetails.ts
import { useQuery } from '@tanstack/react-query';
import { getOrderById } from '@/server/actions/orders';
import { EnrichedOrders } from '@/types/orders';

export function useOrderDetails(orderId: string | null, initialData?: EnrichedOrders) {
  return useQuery({
    queryKey: ['order', orderId],
    queryFn: async () => {
      if (!orderId) return null;
      const result = await getOrderById(orderId);
      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to fetch order');
      }
      return result.data;
    },
    enabled: !!orderId,
    initialData: initialData || undefined,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

// src/hooks/orders/useOrderStatus.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateOrder } from '@/server/actions/orders';
import { OrderStatus } from '@/types/orders';

export function useOrderStatusMutation() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ orderId, status }: { orderId: string; status: OrderStatus }) => {
      return updateOrder({ orderId, status });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['order', variables.orderId] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    }
  });
}
```

### 6. Implementation Strategy

1. **Step 1: Create the Directory Structure**
   - Create the new folder structure
   - Move components to appropriate locations

2. **Step 2: Implement Context**
   - Create OrderDetailContext and provider
   - Extract state management logic from components

3. **Step 3: Client Component Wrapper**
   - Create OrderDetailClient.tsx
   - Migrate rendering logic from current components

4. **Step 4: Individual Components**
   - Split current OrderDetails.tsx into smaller components
   - Connect components to context

5. **Step 5: Refactor Hooks**
   - Organize hooks into dedicated files
   - Update hook implementations for better typing

6. **Step 6: Update Page Components**
   - Update the order detail page to use new components
   - Ensure server/client component boundaries are correct

7. **Step 7: Transition Period**
   - Temporarily keep old files with "DEPRECATED" markers
   - Move over to new implementation gradually

## Benefits

1. **Improved Code Organization**:
   - Logical grouping of related components
   - Clear separation of concerns

2. **Better State Management**:
   - Context-based state reduces prop drilling
   - Improved type safety

3. **Easier Maintenance**:
   - Smaller, focused components
   - Clearer component responsibilities

4. **Reusability**:
   - Components can be reused in different contexts
   - Hooks provide shared logic

5. **Performance Optimization**:
   - More granular component updates
   - Better control over re-renders

## Testing Strategy

1. **Component Tests**:
   - Test individual components in isolation
   - Mock context provider for testing

2. **Integration Tests**:
   - Test Order Details page with real data
   - Verify proper data flow

3. **User Flow Tests**:
   - Test status update workflow
   - Test edit/save workflow