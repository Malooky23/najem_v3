// import NextAuth, {CredentialsSignin} from "next-auth"
// import Credentials from "next-auth/providers/credentials"
// import {QUERIES} from '@/server/db/queries'
// import {
//   InvalidCredentialsError,
//   MissingCredentialsError,
//   DatabaseError,
//   UserNotFoundError,
// } from './errors'
// // import authConfig from "./auth.config"

// const errorMessages: Record<string, string> = {
//   CREDENTIALS_MISSING: "Please provide both email and password",
//   INVALID_CREDENTIALS: "Invalid email or password",
//   UNKNOWN_ERROR: "An unexpected error occurred",
//   USER_NOT_FOUND: "User not found",
//   DATABASE_ERROR: "Database error occurred",
//   Default: "Unable to sign in",
// }

// export const {
//   handlers,
//   auth,
//   signIn,
//   signOut,
// } = NextAuth({
//   session: { 
//     strategy: "jwt",
//     maxAge: 60 * 60 * 24,
//     updateAge:24 * 60 * 60
//   },
//   pages: {
//     signIn: "/login",
//     error: "/error",
//     signOut: "/",
//   },
//   providers: [
//     Credentials
//     ({
//       async authorize(credentials, req) {
//         try {
//           if (typeof credentials?.email !== 'string' || typeof credentials?.password !== 'string') {
//             throw new MissingCredentialsError()
//           }

//           const ip = req.headers?.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown"
//           const userAgent = req.headers?.get("user-agent") || "unknown"

//           try {
//             const result = await QUERIES.authenticateUser(
//               credentials.email,
//               credentials.password,
//               ip,
//               userAgent
//             )

//             if (!result) {
//               throw new InvalidCredentialsError()
//             }

//             return result
//           } catch (error) {
//             if (error instanceof Error) {
//               switch (error.message) {
//                 case "USER_NOT_FOUND":
//                   throw new UserNotFoundError()
//                 case "DATABASE_ERROR":
//                   throw new DatabaseError()
//                 default:
//                   throw new InvalidCredentialsError()
//               }
//             }
//             throw new InvalidCredentialsError()
//           }
//         } catch (error) {
//           if (error instanceof CredentialsSignin) {
//             throw error
//           }
//           throw new InvalidCredentialsError()
//         }
//       },
//     }),
//   ],
//   callbacks: {
    // async jwt({ token, user }) {
    //   if (user) {
    //     Object.assign(token, {
    //       id: user.id,
    //       email: user.email,
    //       name: user.name,
    //       userType: user.userType,
    //       isAdmin: user.isAdmin,
    //       customerId: user.customerId
    //     })
    //   }
    //   return token
//     },

//     async session({ session, token }) {
//       if (session.user) {
//         Object.assign(session.user, {
//           id: token.id,
//           email: token.email,
//           name: token.name,
//           userType: token.userType,
//           isAdmin: token.isAdmin,
//           customerId: token.customerId
//         })
//       }
//       return session
//     },
//   },
//   // ...authConfig
// })

// // Helper function to get error message
// export function getAuthErrorMessage(error: string): string {
//   return errorMessages[error] || errorMessages.Default
// }

// src/lib/auth/auth.ts
import NextAuth, { CredentialsSignin } from "next-auth";
import Credentials from "next-auth/providers/credentials"; // Keep import
import { authConfig } from "./auth.config"; // Import the base config
import { QUERIES } from '@/server/db/queries';
import {
  InvalidCredentialsError,
  MissingCredentialsError,
  DatabaseError,
  UserNotFoundError,
} from './errors';
import type { UserType } from "@/types/users"; // Assuming UserType is defined

const errorMessages: Record<string, string> = {
  CREDENTIALS_MISSING: "Please provide both email and password",
  INVALID_CREDENTIALS: "Invalid email or password",
  UNKNOWN_ERROR: "An unexpected error occurred",
  USER_NOT_FOUND: "User not found",
  DATABASE_ERROR: "Database error occurred",
  Default: "Unable to sign in",
};

export const {
  handlers,
  auth,
  signIn,
  signOut,
} = NextAuth({
  // Spread the base config (pages, session strategy, authorized callback)
  ...authConfig,

  // --- PROVIDERS (with authorize function) ---
  // Override providers to include the authorize function which uses the DB
  providers: [
    Credentials({
      // authorize function runs on sign-in attempt (Node.js runtime)
      async authorize(credentials, req) {
        try {
          if (typeof credentials?.email !== 'string' || typeof credentials?.password !== 'string') {
            throw new MissingCredentialsError();
          }

          const ip = req.headers?.get("x-forwarded-for")?.split(",")[ 0 ]?.trim() || "unknown";
          const userAgent = req.headers?.get("user-agent") || "unknown";

          try {
            const result = await QUERIES.authenticateUser(
              credentials.email,
              credentials.password,
              ip,
              userAgent
            );

            if (!result) {
              throw new InvalidCredentialsError();
            }
            // IMPORTANT: Return the user object needed for the JWT/session
            // Ensure the returned object matches what your jwt/session callbacks expect
            return {
              id: result.id, // Assuming result has userId
              email: result.email,
              name: result.name,
              userType: result.userType,
              isAdmin: result.isAdmin,
              customerId: result.customerId,
            };
          } catch (error) {
            if (error instanceof Error) {
              switch (error.message) {
                case "USER_NOT_FOUND": throw new UserNotFoundError();
                case "DATABASE_ERROR": throw new DatabaseError();
                default: throw new InvalidCredentialsError();
              }
            }
            throw new InvalidCredentialsError();
          }
        } catch (error) {
          if (error instanceof CredentialsSignin) throw error;
          console.error("Unexpected authorize error:", error);
          throw new InvalidCredentialsError();
        }
      },
    }),
    // Add other providers if you have them (e.g., Google, GitHub)
    // These would typically be defined in auth.config.ts as they are usually Edge-compatible
  ],

  // --- CALLBACKS (JWT and Session) ---
  // These run in Node.js runtime when session/token is created/updated
  callbacks: {
    // Include the authorized callback from the config
    ...authConfig.callbacks,

    // jwt callback: Add user data to the token after successful authorize
    // async jwt({ token, user }) {
    //   if (user) { // `user` object comes from the `authorize` function return
    //     token.id = user.id;
    //     token.email = user.email;
    //     token.name = user.name;
    //     token.userType = user.userType;
    //     token.isAdmin = user.isAdmin;
    //     token.customerId = user.customerId;
    //   }
    //   return token;
    async jwt({ token, user }) {
      if (user) {
        Object.assign(token, {
          id: user.id,
          email: user.email,
          name: user.name,
          userType: user.userType,
          isAdmin: user.isAdmin,
          customerId: user.customerId
        })
      }
      return token
    },

    // session callback: Add data from the token to the session object
    // async session({ session, token }) {
    //   if (session.user && token.id) {
    //     session.user.id = token.id as string;
    //     session.user.email = token.email as string;
    //     session.user.name = token.name as string;
    //     session.user.userType = token.userType as UserType;
    //     session.user.isAdmin = token.isAdmin as boolean;
    //     session.user.customerId = token.customerId as string | undefined;
    //   }
    //   return session;
    async session({ session, token }) {
          if (session.user) {
            Object.assign(session.user, {
              id: token.id,
              email: token.email,
              name: token.name,
              userType: token.userType,
              isAdmin: token.isAdmin,
              customerId: token.customerId
            })
          }
          return session
    },
  },
  // Add adapter here if you were using one (e.g., PrismaAdapter)
  // adapter: PrismaAdapter(prisma), // Example
});

// Helper function (keep as is)
export function getAuthErrorMessage(error: string): string {
  return errorMessages[ error ] || errorMessages.Default;
}
