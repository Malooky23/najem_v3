'use server'
import { ApiResponse } from '@/types/common';
import { createOrderExpenseSchemaType, orderExpenseSchemaType } from '@/types/expense'
import { EnrichedOrderSchemaType } from '@/types/orders';
import { withAuth } from './auth-check';
import { User } from 'next-auth';
import { createOrderExpenseInDb } from '../DB-Queries/orders-queries';



export async function createOrderExpense(data: createOrderExpenseSchemaType): Promise<ApiResponse<orderExpenseSchemaType>> {
    // First await the withAuth call to get the handler function
    const authHandler = await withAuth(async (user: User, data: createOrderExpenseSchemaType): Promise<ApiResponse<orderExpenseSchemaType>> => {
        const { userType, id } = user;

        if (id !== data[0].createdBy) {
            return { success: false, message: "Unauthorized" };
        }
        if (userType === 'CUSTOMER') {
            return { success: false, message: "Unauthorized" };
        }
        if (userType === 'EMPLOYEE') {
            return await createOrderExpenseInDb(data);
        }
        return { success: false, message: "Unauthorized" };
    });

    // Then call the handler with the data
    return authHandler(data);
}