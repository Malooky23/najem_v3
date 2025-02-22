'use client';
import { useQuery } from "@tanstack/react-query";
import { type ItemSchemaType } from "@/types/items";
import { EnrichedCustomer } from "@/types/customer";
import { EnrichedOrders } from "@/types/orders";
import { getSession } from 'next-auth/react';
import { getOrders } from "@/server/actions/orders";



export function useCustomers() {
  return useQuery<EnrichedCustomer[]>({
    queryKey: ['customers'],
    queryFn: async () => {
      const session = await getSession()
      const res = await fetch('/api/customers', {
        headers: {
          'Authorization': `Bearer ${session}` // Include token in header
        }
      }); // Call API route
      if (!res.ok) {
        throw new Error('Failed to fetch customers');
      }
      return res.json();
    },
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    staleTime: 100 * 100 * 100 * 100,
  });
}


export function useItems() {
  return useQuery<ItemSchemaType[]>({
    queryKey: ['items'],
    queryFn: async () => {
      const session = await getSession(); // Get session on client-side

      const res = await fetch('/api/items', {
        headers: {
          'Authorization': `Bearer ${session}` // Include token in header
        }
      });
      if (!res.ok) {
        let errorResponse;
        try {
          errorResponse = await res.json(); // Try to parse JSON response
        } catch (jsonError) {
          errorResponse = { message: 'Failed to parse error response as JSON', rawResponse: await res.text() }; // If JSON parsing fails, include raw text
          console.error("JSON parsing error:", jsonError);
        }
        console.error("API error response:", errorResponse); // Log the error response for debugging
        throw new Error(`Failed to fetch items. API Response: ${JSON.stringify(errorResponse)}`);
      }
      return res.json();
    },
    staleTime: 1000 * 60 * 5, // Optional: cache for 5 minutes
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });
}

export function useOrders() {
  return useQuery<EnrichedOrders[]>({
    queryKey: ['orders'],
    queryFn: async () => {
      const result = await getOrders();
      if (!result.success) {
        console.log("(!result.success)", result);
        throw new Error(result.error || 'Failed to fetch orders');
      }
      if (result.data === undefined) {
        console.log("result.data === undefined", result);

        throw new Error(result.error || 'Failed to fetch orders');
      } else {
        console.log("SUCCESS", result);

        return result.data.orders;

      }

    },
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    staleTime: 100 * 100 * 100 * 100,
  });
}

// export function useItemsOLD() {
//   return useQuery<ItemSchemaType[]>({
//     queryKey: ['items'],
//     queryFn: async () => {
//       try {
//         const response = await getItems();
//         return response; // Make sure to return the data
//       } catch (error) {
//         console.error("Error items:", error);
//         throw error;
//       }
//     },
//     staleTime: 1000 * 60 * 5, // Optional: cache for 5 minutes
//     refetchOnMount: false,
//     refetchOnWindowFocus: false,
//   });
// }

// export function useCustomersOLD() {
//   return useQuery({
//     queryKey: ['customers'],
//     queryFn: async () => {
//       try {
//         // await new Promise((resolve) => setTimeout(resolve, 2000))
//         return await getCustomers();
//         // return customers.map(customer => customerSchema.parse(customer));
//       } catch (error) {
//         console.error("Error fetching/validating customers:", error);
//         throw error;
//       }
//     },
//     refetchOnMount:false,
//     refetchOnWindowFocus:false,
//     staleTime: 100*100*100*100
//   });
// }