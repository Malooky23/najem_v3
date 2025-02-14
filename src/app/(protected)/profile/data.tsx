// app/profile/page.tsx
'use server'
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { auth } from "@/lib/auth/auth"; // Assume you have auth setup
import { db } from "@/server/db";
import { users } from "@/server/db/schema";
import { eq } from "drizzle-orm";
import { format } from "date-fns";
import React from "react";

export default async function ProfilePage() {
    const session = await auth();
    if (!session) return <div className="align">Not authenticated</div>;
  
  
    const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
    await delay(30000); // Delay for the specified time
  
    const userData = await db
      .select({
        firstName: users.firstName,
        lastName: users.lastName,
        email: users.email,
        userType: users.userType,
        lastLogin: users.lastLogin,
        createdAt: users.createdAt,
      })
      .from(users)
      .where(eq(users.userId, session.user.id!))
      .then((res) => res[0]);
  
    return (
  
      <div className="max-w-2xl mx-auto p-4">
        <Card>
          <CardHeader className="border-b">
            <h2 className="text-2xl font-semibold">Profile</h2>
          </CardHeader>
          <CardContent className="pt-4 space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">First Name</label>
              <p className="p-2 bg-muted rounded-md">{userData.firstName}</p>
            </div>
  
            <div className="space-y-2">
              <label className="text-sm font-medium">Last Name</label>
              <p className="p-2 bg-muted rounded-md">{userData.lastName}</p>
            </div>
  
            <div className="space-y-2">
              <label className="text-sm font-medium">Email</label>
              <p className="p-2 bg-muted rounded-md">{userData.email}</p>
            </div>
  
            <div className="space-y-2">
              <label className="text-sm font-medium">Account Type</label>
              <p className="p-2 bg-muted rounded-md">{userData.userType}</p>
            </div>
  
            <div className="space-y-2">
              <label className="text-sm font-medium">Last Login</label>
              <p className="p-2 bg-muted rounded-md">
                {format(new Date(userData.lastLogin ?? ""), "PPpp")}
              </p>
            </div>
  
            <div className="space-y-2">
              <label className="text-sm font-medium">Member Since</label>
              <p className="p-2 bg-muted rounded-md">
                {format(new Date(userData.createdAt), "PP")}
              </p>
            </div>
            </CardContent>
            </Card>
      </div>
  
    );
  }
  
  
  
  