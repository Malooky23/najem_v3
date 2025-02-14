import {User, AuthResult} from 'next-auth'
import { db } from '@/server/db'
import { sql } from 'drizzle-orm'

export default async function authenticateUser (
    email: string,
    password: string,
    ip: string,
    userAgent: string
  ): Promise<User | null> {
    try {
      const result = await db.execute<{ auth_result: AuthResult }>(
        sql`SELECT authenticate_user(${email}, ${password}, ${ip}::inet, ${userAgent}) as auth_result`
      )

      const authData = result.rows[0]?.auth_result

      if (!authData?.user || authData.status !== 'success') {
        throw new Error(authData?.message || 'Authentication failed')
      }

      // Transform the database result into a next-auth User object
      const user: User = {
        id: authData.user.user_id,
        email: authData.user.email,
        name: `${authData.user.first_name} ${authData.user.last_name}`,
        userType: authData.user.user_type,
        isAdmin: authData.user.is_admin,
        customerId: authData.user.customer_id
      }

      return user
    } catch (error) {
      console.error('Authentication error:', error)
      return null
    }
  }