import { type User } from '@/server/db/schema'
import { z } from 'zod'

export interface UserType extends User {
    userId: string,
    email: string,
    firstName: string,
    lastName: string,
    userType: 'EMPLOYEE' | 'CUSTOMER' | 'DEMO'
    isAdmin: boolean,
    isActive: boolean,
    lastLogin: string,
    customerId: string | null,
    loginCount: number,
    createdAt: string,
    updatedAt: string | null
} 

export const UserZod = z.object({
    userId: z.string().uuid(),
    email: z.string().email(),
    firstName: z.string(),
    lastName: z.string(),
    userType: z.enum(['EMPLOYEE', 'CUSTOMER', 'DEMO']),
    isAdmin: z.boolean(),
    isActive: z.boolean(),
    lastLogin: z.string(),
    customerId: z.string().nullable(),
    loginCount: z.number(),
    createdAt: z.string(),
    updatedAt: z.string().nullable()
})