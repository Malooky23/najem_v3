// src/server/services/customer-service.ts
import { QUERIES } from '@/server/db/queries';
import { customerList, CustomerList, customerSchema, EnrichedCustomer } from '@/types/customer';
import { z } from 'zod';

export const customerService = {
    async getAllCustomers(): Promise<EnrichedCustomer[]> {
        try {
            const rawCustomers = await QUERIES.getAllCustomersFULL();
            const validatedCustomers = z.array(customerSchema).parse(rawCustomers);
            return validatedCustomers;
        } catch (error) {
            if (error instanceof z.ZodError) {
                console.error("Data validation error:", JSON.stringify(error.errors, null, 2));
                throw new Error("Invalid data structure received from database");
            }
            console.error("Database query error:", error);
            throw new Error("Failed to fetch customers");
        }
    },
    async getCustomerSelectList(): Promise<CustomerList[]> {
        try {
            const rawCustomers = await QUERIES.getCustomerList();
            const validatedCustomers = z.array(customerList).parse(rawCustomers);
            return validatedCustomers;
        } catch (error) {
            if (error instanceof z.ZodError) {
                console.error("Data validation error:", JSON.stringify(error.errors, null, 2));
                throw new Error("Invalid data structure received from database");
            }
            console.error("Database query error:", error);
            throw new Error("Failed to fetch customers");
        }
    },
    async getSingleCustomer(customerId:string): Promise<EnrichedCustomer[]> {
        try {
            const rawCustomers = await QUERIES.getSingleCustomersFULL(customerId); //<-- This returns an object
            const validatedCustomers = z.array(customerSchema).parse([rawCustomers]); // But i need to be returning an array
            return validatedCustomers;
        } catch (error) {
            if (error instanceof z.ZodError) {
                console.error("Data validation error:", JSON.stringify(error.errors, null, 2));
                throw new Error("Invalid data structure received from database");
            }
            console.error("Database query error:", error);
            throw new Error("Failed to fetch customers");
        }
    },
    // ... you can add more customer-related service functions here later
};