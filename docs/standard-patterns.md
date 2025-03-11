# Najem v3: Standard Patterns & Reference

This document provides quick reference examples for implementing standard patterns in the Najem v3 codebase.

## Table of Contents

1. [Server/Client Components](#serverClient-components)
2. [Context Providers](#context-providers)
3. [Data Fetching](#data-fetching)
4. [Form Handling](#form-handling)
5. [Table Components](#table-components)
6. [Error Handling](#error-handling)
7. [Loading States](#loading-states)
8. [Modals & Dialogs](#modals--dialogs)

## Server/Client Components

### Server Component Page

```tsx
// app/(dashboard)/feature/page.tsx
import { FeatureClient } from './components/FeatureClient';
import { getFeatureData } from '@/server/actions/feature';

export default async function FeaturePage({ 
  searchParams 
}: { 
  searchParams: { [key: string]: string | undefined } 
}) {
  // Convert search params to filter object
  const filters = parseSearchParams(searchParams);
  
  // Fetch initial data on server
  const initialData = await getFeatureData(filters);
  
  return (
    <FeatureClient 
      initialData={initialData} 
      initialFilters={filters} 
    />
  );
}
```

### Client Wrapper

```tsx
// app/(dashboard)/feature/components/FeatureClient.tsx
'use client';

import { FeatureProvider } from './FeatureProvider';
import { FeatureHeader } from './FeatureHeader';
import { FeatureList } from './FeatureList';
import { FeatureDetail } from './FeatureDetail';

interface FeatureClientProps {
  initialData: FeatureData;
  initialFilters: FeatureFilters;
}

export function FeatureClient({ 
  initialData,
  initialFilters
}: FeatureClientProps) {
  return (
    <FeatureProvider 
      initialData={initialData} 
      initialFilters={initialFilters}
    >
      <div className="p-4 space-y-4">
        <FeatureHeader />
        <div className="flex gap-4">
          <FeatureList />
          <FeatureDetail />
        </div>
      </div>
    </FeatureProvider>
  );
}
```

## Context Providers

### Context Creation

```tsx
// app/(dashboard)/feature/components/FeatureProvider.tsx
'use client';

import { createContext, useContext, useState } from 'react';
import { useFeatureData } from '../hooks/useFeatureData';

interface FeatureContextType {
  data: FeatureData | null;
  isLoading: boolean;
  filters: FeatureFilters;
  setFilters: (filters: FeatureFilters) => void;
  selectedId: string | null;
  setSelectedId: (id: string | null) => void;
}

const FeatureContext = createContext<FeatureContextType | null>(null);

interface FeatureProviderProps {
  children: React.ReactNode;
  initialData: FeatureData;
  initialFilters: FeatureFilters;
}

export function FeatureProvider({
  children,
  initialData,
  initialFilters
}: FeatureProviderProps) {
  // Local state
  const [filters, setFilters] = useState<FeatureFilters>(initialFilters);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  
  // Data fetching with React Query
  const { data, isLoading } = useFeatureData(filters, initialData);
  
  // Memoize context value to prevent unnecessary re-renders
  const value = useMemo(() => ({
    data,
    isLoading,
    filters,
    setFilters,
    selectedId,
    setSelectedId
  }), [data, isLoading, filters, selectedId]);
  
  return (
    <FeatureContext.Provider value={value}>
      {children}
    </FeatureContext.Provider>
  );
}

// Custom hook to use the context
export function useFeature() {
  const context = useContext(FeatureContext);
  
  if (!context) {
    throw new Error('useFeature must be used within a FeatureProvider');
  }
  
  return context;
}
```

## Data Fetching

### Server Action

```tsx
// server/actions/feature.ts
'use server';

import { z } from 'zod';
import { db } from '@/server/db';
import { auth } from '@/lib/auth/auth';
import { featureSchema } from '@/types/feature';

export async function getFeatureData(filters: FeatureFilters) {
  try {
    // Auth check
    const session = await auth();
    if (!session?.user?.id) {
      return { 
        success: false, 
        error: "Unauthorized: Must be logged in to access this resource." 
      };
    }
    
    // Build query
    const query = buildFeatureQuery(filters);
    
    // Execute query
    const results = await db.execute(query);
    
    // Validate results
    const validatedData = featureSchema.parse(results.rows);
    
    return { 
      success: true, 
      data: validatedData 
    };
  } catch (error) {
    console.error('Error in getFeatureData:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'An unknown error occurred'  
    };
  }
}
```

### React Query Hook

```tsx
// app/(dashboard)/feature/hooks/useFeatureData.ts
'use client';

import { useQuery } from '@tanstack/react-query';
import { getFeatureData } from '@/server/actions/feature';

export function useFeatureData(
  filters: FeatureFilters,
  initialData?: FeatureData
) {
  return useQuery({
    queryKey: ['feature', filters],
    queryFn: async () => {
      const result = await getFeatureData(filters);
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch feature data');
      }
      
      return result.data;
    },
    initialData,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
```

## Form Handling

### Form Hook

```tsx
// app/(dashboard)/feature/hooks/useFeatureForm.ts
'use client';

import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createFeature, updateFeature } from '@/server/actions/feature';
import { FeatureFormSchema, type FeatureFormData } from '@/types/feature';
import { toast } from '@/hooks/use-toast';

export function useFeatureForm(
  initialData?: FeatureData,
  onSuccess?: () => void
) {
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form setup with Zod validation
  const form = useForm<FeatureFormData>({
    resolver: zodResolver(FeatureFormSchema),
    defaultValues: initialData || {
      name: '',
      description: '',
      status: 'active',
    },
    mode: 'onChange',
  });
  
  // Create mutation
  const createMutation = useMutation({
    mutationFn: createFeature,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['features'] });
      toast({
        title: 'Success',
        description: 'Feature created successfully',
      });
      onSuccess?.();
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to create feature',
        variant: 'destructive',
      });
    },
  });
  
  // Update mutation
  const updateMutation = useMutation({
    mutationFn: updateFeature,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['features'] });
      toast({
        title: 'Success',
        description: 'Feature updated successfully',
      });
      onSuccess?.();
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update feature',
        variant: 'destructive',
      });
    },
  });
  
  // Form submission handler
  const onSubmit = async (data: FeatureFormData) => {
    try {
      setIsSubmitting(true);
      
      if (initialData?.id) {
        await updateMutation.mutateAsync({
          id: initialData.id,
          ...data,
        });
      } else {
        await createMutation.mutateAsync(data);
      }
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return {
    form,
    onSubmit: form.handleSubmit(onSubmit),
    isSubmitting,
    isCreate: !initialData?.id,
  };
}
```

### Form Component

```tsx
// app/(dashboard)/feature/components/FeatureForm.tsx
'use client';

import { useFeatureForm } from '../hooks/useFeatureForm';
import { Button } from '@/components/ui/button';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';

interface FeatureFormProps {
  initialData?: FeatureData;
  onSuccess?: () => void;
}

export function FeatureForm({ initialData, onSuccess }: FeatureFormProps) {
  const { form, onSubmit, isSubmitting, isCreate } = useFeatureForm(initialData, onSuccess);
  
  return (
    <Form {...form}>
      <form onSubmit={onSubmit} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Status</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : isCreate ? 'Create' : 'Update'}
        </Button>
      </form>
    </Form>
  );
}
```

## Table Components

### Table Columns Definition

```tsx
// app/(dashboard)/feature/components/feature-columns.ts
'use client';

import { ColumnDef } from '@tanstack/react-table';
import { FeatureData } from '@/types/feature';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/lib/utils';

export const featureColumns: ColumnDef<FeatureData>[] = [
  {
    accessorKey: 'name',
    header: 'Name',
    cell: ({ row }) => (
      <div className="font-medium">{row.getValue('name')}</div>
    ),
  },
  {
    accessorKey: 'description',
    header: 'Description',
    cell: ({ row }) => {
      const description = row.getValue('description') as string;
      return (
        <div className="max-w-[300px] truncate">{description}</div>
      );
    },
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const status = row.getValue('status') as string;
      return (
        <Badge
          variant={
            status === 'active' ? 'default' :
            status === 'inactive' ? 'outline' : 'secondary'
          }
        >
          {status}
        </Badge>
      );
    },
  },
  {
    accessorKey: 'createdAt',
    header: 'Created',
    cell: ({ row }) => {
      const date = row.getValue('createdAt') as Date;
      return <div>{formatDate(date)}</div>;
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const feature = row.original;
      
      return (
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => handleEdit(feature.id)}
          >
            Edit
          </Button>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => handleDelete(feature.id)}
          >
            Delete
          </Button>
        </div>
      );
    },
  },
];

function handleEdit(id: string) {
  // Edit function implementation
}

function handleDelete(id: string) {
  // Delete function implementation
}
```

### Table Component

```tsx
// app/(dashboard)/feature/components/FeatureTable.tsx
'use client';

import { useState } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
  SortingState,
} from '@tanstack/react-table';
import { featureColumns } from './feature-columns';
import { useFeature } from './FeatureProvider';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';

export function FeatureTable() {
  const { data, isLoading } = useFeature();
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState('');
  
  const table = useReactTable({
    data: data?.features || [],
    columns: featureColumns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    state: {
      sorting,
      globalFilter,
    },
  });
  
  if (isLoading) {
    return <div>Loading...</div>;
  }
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Input
          placeholder="Filter features..."
          value={globalFilter ?? ''}
          onChange={(e) => setGlobalFilter(e.target.value)}
          className="max-w-sm"
        />
        <Button onClick={() => table.resetSorting()}>
          Reset sorting
        </Button>
      </div>
      
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={featureColumns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      
      <div className="flex items-center justify-end space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
```

## Error Handling

### Error Boundary Component

```tsx
// components/ui/error-boundary.tsx
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function ErrorBoundary({
  children,
  fallback,
}: ErrorBoundaryProps) {
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const handleError = (error: ErrorEvent) => {
      setError(error.error);
    };

    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);

  if (error) {
    return fallback || (
      <div className="p-4 border border-red-200 rounded-md bg-red-50">
        <div className="flex items-center gap-2 text-red-700 mb-2">
          <AlertTriangle className="h-5 w-5" />
          <h3 className="font-medium">Something went wrong</h3>
        </div>
        <p className="text-sm text-red-600 mb-4">
          {error.message || 'An unknown error occurred'}
        </p>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setError(null)}
        >
          Try again
        </Button>
      </div>
    );
  }

  return <>{children}</>;
}
```

### API Error Handling

```tsx
// lib/api-error.ts
export class ApiError extends Error {
  public statusCode: number;
  public code: string;
  public field?: string;

  constructor({
    message,
    statusCode,
    code,
    field,
  }: {
    message: string;
    statusCode: number;
    code: string;
    field?: string;
  }) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.code = code;
    this.field = field;
  }
}

export function handleApiError(error: unknown) {
  if (error instanceof ApiError) {
    return {
      success: false,
      error: {
        message: error.message,
        code: error.code,
        field: error.field,
      },
    };
  }

  console.error('Unhandled API error:', error);
  
  return {
    success: false,
    error: {
      message: error instanceof Error ? error.message : 'An unknown error occurred',
      code: 'UNKNOWN_ERROR',
    },
  };
}
```

## Loading States

### Loading Spinner

```tsx
// components/ui/loading-spinner.tsx
export function LoadingSpinner({ size = 'default' }: { size?: 'sm' | 'default' | 'lg' }) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    default: 'h-6 w-6',
    lg: 'h-8 w-8',
  };

  return (
    <svg
      className={`animate-spin ${sizeClasses[size]} text-primary`}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      ></circle>
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      ></path>
    </svg>
  );
}
```

### Loading Skeleton

```tsx
// components/ui/table-skeleton.tsx
import { Skeleton } from '@/components/ui/skeleton';

export function TableSkeleton({
  columns = 5,
  rows = 5,
}: {
  columns?: number;
  rows?: number;
}) {
  return (
    <div className="rounded-md border">
      <div className="h-10 border-b bg-muted/5 px-4 flex items-center">
        {Array.from({ length: columns }).map((_, i) => (
          <div key={i} className="flex-1">
            <Skeleton className="h-4 w-24" />
          </div>
        ))}
      </div>
      
      <div>
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div
            key={rowIndex}
            className="h-16 px-4 border-b flex items-center"
          >
            {Array.from({ length: columns }).map((_, colIndex) => (
              <div key={colIndex} className="flex-1">
                <Skeleton className="h-4 w-full max-w-[120px]" />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
```

## Modals & Dialogs

### Dialog Component

```tsx
// app/(dashboard)/feature/components/FeatureDialog.tsx
'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { FeatureForm } from './FeatureForm';
import { Plus } from 'lucide-react';

interface FeatureDialogProps {
  initialData?: FeatureData;
  buttonText?: string;
  title?: string;
}

export function FeatureDialog({
  initialData,
  buttonText = 'Create Feature',
  title = 'Create Feature',
}: FeatureDialogProps) {
  const [open, setOpen] = useState(false);
  
  const handleSuccess = () => {
    setOpen(false);
  };
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          {buttonText}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <FeatureForm
          initialData={initialData}
          onSuccess={handleSuccess}
        />
      </DialogContent>
    </Dialog>
  );
}
```

### Confirmation Dialog

```tsx
// components/ui/confirmation-dialog.tsx
'use client';

import { useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

interface ConfirmationDialogProps {
  title: string;
  description: string;
  actionLabel: string;
  variant?: 'default' | 'destructive';
  onConfirm: () => Promise<void>;
  children: React.ReactNode;
}

export function ConfirmationDialog({
  title,
  description,
  actionLabel,
  variant = 'destructive',
  onConfirm,
  children,
}: ConfirmationDialogProps) {
  const [isPending, setIsPending] = useState(false);
  const [open, setOpen] = useState(false);
  
  const handleConfirm = async () => {
    try {
      setIsPending(true);
      await onConfirm();
      setOpen(false);
    } finally {
      setIsPending(false);
    }
  };
  
  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        {children}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            asChild
            onClick={(e) => {
              e.preventDefault();
              handleConfirm();
            }}
          >
            <Button variant={variant} disabled={isPending}>
              {isPending ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  Processing...
                </>
              ) : (
                actionLabel
              )}
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
```

By following these standard patterns consistently across the codebase, we'll create a more maintainable, predictable, and developer-friendly project.