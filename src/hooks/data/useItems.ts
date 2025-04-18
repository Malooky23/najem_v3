'use client'

import { CreateItemsSchemaType, ItemSchemaType, UpdateItemSchemaType } from "@/types/items";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createItem, getItems, updateItem } from "@/server/services/NEW-items-services";
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


