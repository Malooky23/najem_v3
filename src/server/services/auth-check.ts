'use server'

import { auth } from "@/lib/auth/auth";
import { User } from "next-auth";

type AuthResult = {
  success: boolean;
  message?: string;
  user?: User;
};

export async function checkAuth(): Promise<AuthResult> {
  const session = await auth();
  if (!session?.user) {
    return { success: false, message: "Unauthorized - No session or user found" };
  }
  
  const { user } = session;
  const { userType, customerId } = user;
  
  if (userType === "CUSTOMER" && !customerId) {
    return { success: false, message: "Unauthorized - No customer linked to user." };
  }
  
  return { success: true, user };
}

// Modified to make this an async function that returns a function
export async function withAuth<T>(serviceFunction: (user: any, ...args: any[]) => Promise<T>) {
  // This function doesn't need to be awaited immediately - it returns a function for later use
  return async (...args: any[]): Promise<T | { success: false, message: string }> => {
    const authResult = await checkAuth();
    if (!authResult.success) {
      return { success: false, message: authResult.message || "Unauthorized" };
    }
    return serviceFunction(authResult.user, ...args);
  };
}