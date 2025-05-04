'use client'

import { CreateItemsSchemaType, ItemSchemaType, UpdateItemSchemaType } from "@/types/items";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createItem, getItemById, getItems, updateItem } from "@/server/services/NEW-items-services";
import { ApiResponse } from "@/types/common";
import { toast } from "sonner";



// Item filter options
type ItemsFilterOptions = {
  customerId?: string;
};

// Reusable mutation factory to reduce code duplication
function useMutationFactory<T, R>(
  mutationFn: (data: T) => Promise<ApiResponse<R>>,
  options?: {
    onSuccessMessage?: string,
    invalidateQueries?: string[]
  }
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: T) => {
      const response = await mutationFn(data);
      if (!response.success) {
        throw new Error(response.message || "Operation failed");
      }
      return response.data;
    },
    onSuccess: () => {
      // Invalidate relevant queries
      if (options?.invalidateQueries) {
        options.invalidateQueries.forEach(queryKey => {
          queryClient.invalidateQueries({ queryKey: [ queryKey ] });
        });
      }
      toast.success("Item created successfully")

    },
    onError: (error) => {
      // console.error("Failed to create item:", error)
      toast.error(error.message)
    },
  });
}

export function useItemsQuery() {
  return useQuery<ItemSchemaType[], Error>({
    queryKey: [ 'items' ],
    queryFn: async (): Promise<ItemSchemaType[]> => {
      const response = await getItems();
      if (!response.success) {
        console.log(response)
        throw new Error(response.message || "Failed to fetch items");
      }
      return response.data || [];
    },
    staleTime: 60 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    retry: false
  });
}

export function useItemByIdQuery(itemId: string | null | undefined) {
  return useQuery<ItemSchemaType | null, Error>({
    // Query key includes the item ID to uniquely identify this query
    queryKey: [ 'item', itemId ],
    queryFn: async (): Promise<ItemSchemaType | null> => {
      // Only fetch if itemId is provided
      if (!itemId) {
        return null;
      }
      const response = await getItemById(itemId);
      if (!response.success) {
        // Don't throw error if simply "not found", return null
        if (response.message === "Item not found.") {
          console.log(`Item ${itemId} not found via query.`);
          return null;
        }
        // Throw error for other failures (e.g., unauthorized, server error)
        throw new Error(response.message || `Failed to fetch item ${itemId}`);
      }
      return response.data ?? null; // Ensure null is returned if data is missing
    },
    // Enable the query only if itemId has a value
    enabled: !!itemId,
    staleTime: 5 * 60 * 1000, // Data might not change often once fetched
    gcTime: 30 * 60 * 1000,
    refetchOnWindowFocus: false, // Less critical to refetch single item on focus
    retry: (failureCount, error) => {
      // Do not retry if the error is 'Unauthorized' or 'Not Found'
      if (error.message.includes('Unauthorized') || error.message.includes('not found')) {
        return false;
      }
      // Retry other errors (e.g., network issues) up to 2 times
      return failureCount < 2;
    },
  });
}

export function useCreateItem() {
  return useMutationFactory<CreateItemsSchemaType, ItemSchemaType>(
    createItem,
    { invalidateQueries: [ 'items' ] }
  )
}

export function useUpdateItem() {
  return useMutationFactory<UpdateItemSchemaType, ItemSchemaType>(
    updateItem,
    { invalidateQueries: [ 'items' ] }
  )
}


