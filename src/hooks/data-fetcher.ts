'use client';

import { QueryClient, useQuery } from "@tanstack/react-query";
import { type ItemZod } from "@/types/items";
// import { customerSchema } from "@/types/customer";
import { getCustomers, getItems } from "@/actions/get-customers";



export function useCustomers() {
  return useQuery({
    queryKey: ['customers'],
    queryFn: async () => {
      try {
        // await new Promise((resolve) => setTimeout(resolve, 2000))
        return await getCustomers();
        // return customers.map(customer => customerSchema.parse(customer));
      } catch (error) {
        console.error("Error fetching/validating customers:", error);
        throw error;
      }
    },
    refetchOnMount:false,
    refetchOnWindowFocus:false,
    staleTime: 100*100*100*100
  });
}


export function useItems() {
  return useQuery<ItemZod[]>({
    queryKey: ['items'],
    queryFn: async () => {
      try {
        const response = await getItems();
        return response; // Make sure to return the data
      } catch (error) {
        console.error("Error items:", error);
        throw error;
      }
    },
    staleTime: 1000 * 60 * 5, // Optional: cache for 5 minutes
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });
}
