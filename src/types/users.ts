import { type User } from '@/server/db/schema'

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