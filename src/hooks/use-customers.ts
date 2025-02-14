'use client';

import { useQuery } from "@tanstack/react-query";
// import { customerSchema } from "@/types/customer";
import { getCustomers } from "@/actions/get-customers";

export function useCustomers() {
  return useQuery({
    queryKey: ['customers'],
    queryFn: async () => {
      try {
        return await getCustomers();
        // return customers.map(customer => customerSchema.parse(customer));
      } catch (error) {
        console.error("Error fetching/validating customers:", error);
        throw error;
      }
    },
  });
}