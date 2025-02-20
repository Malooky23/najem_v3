import NextAuth, {CredentialsSignin} from "next-auth"
import Credentials from "next-auth/providers/credentials"
import {QUERIES} from '@/server/db/queries'
import {
  InvalidCredentialsError,
  MissingCredentialsError,
  DatabaseError,
  UserNotFoundError,
} from './errors'
// import authConfig from "./auth.config"

const errorMessages: Record<string, string> = {
  CREDENTIALS_MISSING: "Please provide both email and password",
  INVALID_CREDENTIALS: "Invalid email or password",
  UNKNOWN_ERROR: "An unexpected error occurred",
  USER_NOT_FOUND: "User not found",
  DATABASE_ERROR: "Database error occurred",
  Default: "Unable to sign in",
}

export const {
  handlers,
  auth,
  signIn,
  signOut,
} = NextAuth({
  session: { 
    strategy: "jwt",
    maxAge: 60 * 60 * 24
  },
  pages: {
    signIn: "/login",
    error: "/error",
    signOut: "/",
  },
  providers: [
    Credentials
    ({
      async authorize(credentials, req) {
        try {
          if (typeof credentials?.email !== 'string' || typeof credentials?.password !== 'string') {
            throw new MissingCredentialsError()
          }

          const ip = req.headers?.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown"
          const userAgent = req.headers?.get("user-agent") || "unknown"

          try {
            const result = await QUERIES.authenticateUser(
              credentials.email,
              credentials.password,
              ip,
              userAgent
            )

            if (!result) {
              throw new InvalidCredentialsError()
            }

            return result
          } catch (error) {
            if (error instanceof Error) {
              switch (error.message) {
                case "USER_NOT_FOUND":
                  throw new UserNotFoundError()
                case "DATABASE_ERROR":
                  throw new DatabaseError()
                default:
                  throw new InvalidCredentialsError()
              }
            }
            throw new InvalidCredentialsError()
          }
        } catch (error) {
          if (error instanceof CredentialsSignin) {
            throw error
          }
          throw new InvalidCredentialsError()
        }
      },
    }),
  ],
  callbacks: {
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
  // ...authConfig
})

// Helper function to get error message
export function getAuthErrorMessage(error: string): string {
  return errorMessages[error] || errorMessages.Default
}

