import "server-only";

import { db } from "./index";
import {
  users as usersSchema,
} from "./schema";
import { eq, isNull, and, sql } from "drizzle-orm";
import type { User, AuthResult } from "next-auth";
export const QUERIES = {

  authenticateUser: async function (
    email: string,
    password: string,
    ip: string,
    userAgent: string
  ): Promise<User | null> {
    try {
      const result =  await db.execute<{ auth_result: AuthResult }>(
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
  },
  
  getUserById: async function (userId: string) {
    const user = await db.select().from(usersSchema).where(eq(usersSchema.userId, userId));
    if (user.length === 0) {
      return null;
    }
    return user[0];
  }
};

// export const MUTATIONS = {
//   createFile: async function (input: {
//     file: {
//       name: string;
//       size: number;
//       url: string;
//       parent: number;
//     };
//     userId: string;
//   }) {
//     return await db.insert(filesSchema).values({
//       ...input.file,
//       ownerId: input.userId,
//     });
//   },

//   onboardUser: async function (userId: string) {
//     const rootFolder = await db
//       .insert(foldersSchema)
//       .values({
//         name: "Root",
//         parent: null,
//         ownerId: userId,
//       })
//       .$returningId();

//     const rootFolderId = rootFolder[0]!.id;

//     await db.insert(foldersSchema).values([
//       {
//         name: "Trash",
//         parent: rootFolderId,
//         ownerId: userId,
//       },
//       {
//         name: "Shared",
//         parent: rootFolderId,
//         ownerId: userId,
//       },
//       {
//         name: "Documents",
//         parent: rootFolderId,
//         ownerId: userId,
//       },
//     ]);

//     return rootFolderId;
//   },
// };
