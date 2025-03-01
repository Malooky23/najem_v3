# Order Details Component Refactoring Plan

## 1. Component Extraction

### A. UI Components
1. Create `OrderHeader.tsx`:
   - Extract the header section with order number, status, and action buttons
   - Handle both mobile and desktop layouts
   - Props: `orderNumber, status, onStatusChange, isEditing, onEdit, onSave, onClose`

2. Create `OrderInfoCard.tsx`:
   - Extract the order information card
   - Handle both view and edit modes
   - Props: `order, isEditing, form`

3. Create `OrderItemsTable.tsx`:
   - Extract the items table component
   - Handle both view and edit modes
   - Props: `items, isEditing, form`

4. Create `OrderNotesCard.tsx`:
   - Extract the notes section
   - Handle both view and edit modes
   - Props: `notes, isEditing, form`

### B. Utility Components
1. Create `EditableField.tsx`:
   - Generic component for handling edit/view modes
   - Support different input types (text, select, number)
   - Props: `value, onChange, type, icon, editComponent, viewComponent`

2. Create `StatusBadge.tsx`:
   - Extract status badge with colors
   - Props: `status, className`

## 2. Custom Hooks

1. Create `useOrderForm.ts`:
```typescript
export function useOrderForm(order: EnrichedOrders) {
  const form = useForm<EnrichedOrders>({
    resolver: zodResolver(updateOrderSchema),
    defaultValues: order,
    mode: "onChange"
  });
  
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // Extract form handling logic here
  
  return {
    form,
    isEditing,
    isSaving,
    handleSave,
    handleEdit,
    handleCancel
  };
}
```

2. Create `useStatusChange.ts`:
```typescript
export function useStatusChange(currentStatus: OrderStatus, onSave: (status: OrderStatus) => Promise<void>) {
  // Extract status change logic here
  return {
    handleStatusChange,
    isPending,
    error
  };
}
```

## 3. Constants and Styles

1. Create `orderDetailsStyles.ts`:
```typescript
export const styles = {
  container: {
    mobile: "p-4 h-full overflow-scroll",
    desktop: "p-6 bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 min-h-full overflow-hidden"
  },
  card: {
    mobile: "bg-white",
    desktop: "bg-white/70 backdrop-blur-sm rounded-lg shadow-xl overflow-hidden transition-all hover:shadow-2xl"
  }
  // ... other shared styles
};
```

## 4. Implementation Steps

1. Create new component files
2. Extract components one by one
3. Implement custom hooks
4. Update main OrderDetails component to use new components
5. Add proper TypeScript types for all components
6. Add proper error handling and loading states
7. Add tests for new components and hooks

## 5. Benefits

- Improved code organization and maintainability
- Better reusability of components
- Easier testing of individual components
- Reduced code duplication
- Better separation of concerns
- More consistent error handling
- Better type safety