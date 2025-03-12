"use client"

import { createItemAction } from "@/server/actions/createItem"
import { CreateItemsSchemaType } from "@/types/items"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

export function useCreateItem() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (data: CreateItemsSchemaType) => {
            return await createItemAction(data)
        },
        onMutate: async () => {
            // Cancel any outgoing refetches to avoid optimistic update being overwritten
            await queryClient.cancelQueries({ queryKey: ['items'] })
        },
        onError: (error) => {
            // console.error("Failed to create item:", error)
            toast.error(error.message)
        },
        onSuccess: () => {
            toast.success("Item created successfully")
            // Invalidate the items cache to trigger a refetch
            queryClient.invalidateQueries({ queryKey: ['items'] })
        }
    })
}