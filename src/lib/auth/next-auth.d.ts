import NextAuth from "next-auth"


type UserType = "CUSTOMER" | "EMPLOYEE" | "DEMO"

declare module "next-auth" {
  export interface User {
    id: string
    email: string
    name: string
    userType: UserType
    isAdmin: boolean
    customerId?: string
  }

  interface Session {
    user: User;
  }

  export interface AuthResult {
    status: 'success' | 'error';
    code?: 'invalid_credentials' | 'server_error';
    message?: string;
    user?: {
      user_id: string
      email: string
      first_name: string
      last_name: string
      is_admin: boolean
      user_type: UserType,
      customer_id?: string
    };
  }

}

declare module "next-auth/jwt" {
  interface JWT {
    user_id: string
    email: string
    first_name: string
    last_name: string
    is_admin: boolean
    user_type: UserType,
    customer_id?: string
  }
}
