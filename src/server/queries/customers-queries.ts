'use server'
import { and, eq } from "drizzle-orm";
import { db } from "../db"
import { customers } from "../db/schema";
import { z } from "zod";
import { customerSchema, EnrichedCustomer } from "@/types/customer";
import { auth } from "@/lib/auth/auth";
import { QueryFunction } from "@tanstack/react-query";

export async function fetchCustomers(customerId?: string): Promise<EnrichedCustomer[]> {

    const session = await auth()
    if (!session) {
        throw new Error("Unauthorized")
    }
    try {
        let whereConditions = []
        if (session.user.userType === 'CUSTOMER' && session.user.customerId) {
            whereConditions.push(eq(customers.customerId, session.user.customerId));
        }
        if (customerId) {
            whereConditions.push(eq(customers.customerId, customerId));

        }
        const response = await db.query.customers.findMany({
            with: {
                individual: {
                    columns: {
                        firstName: true,
                        middleName: true,
                        lastName: true,
                        personalID: true
                    }
                },
                business: {
                    columns: {
                        businessName: true,
                        isTaxRegistered: true,
                        taxNumber: true,
                    }
                },
                contacts: {
                    with: {
                        contactDetail: true
                    },
                    columns: {}
                },
                addresses: {
                    with: {
                        address: true
                    },
                    columns: {}
                },
                users: true,
            },
            orderBy: (customers, { desc }) => [ desc(customers.createdAt) ],
            where: and(...whereConditions)
        })
        const validatedCustomers = z.array(customerSchema).parse(response);
        return validatedCustomers;
    } catch (error) {
        if (error instanceof z.ZodError) {
            console.error("Data validation error:", JSON.stringify(error.errors, null, 2));
            throw new Error("Invalid data structure received from database");
        }
        console.error("Database query error:", error);
        throw new Error("Failed to fetch customers");
    }

}