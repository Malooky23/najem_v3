import "server-only";

import { db } from "./index";
import * as schema from './schema';
import { eq, isNull, and, sql, or } from "drizzle-orm";
import type { User, AuthResult, Session } from "next-auth";
import { customers, individualCustomers, businessCustomers } from '@/server/db/schema';
import { CustomerTypes } from '@/types/customer'

export const QUERIES = {
  authenticateUser: async function (
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

      if (!authData) {
        throw new Error("DATABASE_ERROR")
      }

      if (authData.status !== 'success') {
        throw new Error(authData.message || "INVALID_CREDENTIALS")
      }

      if (!authData.user) {
        throw new Error("USER_NOT_FOUND")
      }

      let checkCustomerId = "EMPTY"
      if (!authData.user.customer_id){
        checkCustomerId = "NOT FOUND"
      }
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
      throw error // Re-throw the error to be handled by the authorize callback
    }
  },

  getUserById: async function (userId: string, delayMs?: number) {
    const user = await db.select().from(schema.users).where(eq(schema.users.userId, userId));
    if (user.length === 0) {
      return null;
    }
    return user[0];
  },

getCustomers: async function (delayMs?: number) {
    try {
      const result = db
        .select({
          customerId: customers.customerId,
          customerNumber: customers.customerNumber,
          customerType: customers.customerType,
          country: customers.country,
          individual: {
            firstName: individualCustomers.firstName,
            middleName: individualCustomers.middleName,
            lastName: individualCustomers.lastName,
          },
          business: {
            businessName: businessCustomers.businessName,
          },
        })
        .from(customers)
        .leftJoin(
          individualCustomers,
          eq(customers.customerId, individualCustomers.individualCustomerId)
        )
        .leftJoin(
          businessCustomers,
          eq(customers.customerId, businessCustomers.businessCustomerId)
        )
        .orderBy(customers.customerId);

      return result;
    } catch (error) {
      console.error('[GET_CUSTOMERS_ERROR]', error);
      throw error;
    }
  },

  getAllCustomersBasic: async function () {
    // Optimized query with only necessary fields
    return db.query.customers.findMany({
      with: {
        individual: {
          columns: {
            firstName: true,
            middleName: true,
            lastName: true,
          }
        },
        business: {
          columns: {
            businessName: true,
          }
        },
      },
      // Add ordering to use index
      orderBy: (customers, { desc }) => [desc(customers.createdAt)]
    })
  },

  getAllCustomersFULL: async function () {
    return db.query.customers.findMany({
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
      orderBy: (customers, { desc }) => [desc(customers.createdAt)]

    })
  },
  getSingleCustomersFULL: async function (customerId:string) {
    return db.query.customers.findFirst({
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
      where: eq(customers.customerId, customerId),
      orderBy: (customers, { desc }) => [desc(customers.createdAt)]

    })
  }

}




