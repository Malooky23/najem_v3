import { QUERIES } from "@/server/db/queries";
import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"

export const {
  handlers,
  auth,
  signIn,
  signOut,
} = NextAuth({
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
    // error: "/login",
    signOut: "/",
  },

  providers: [
    Credentials({
      async authorize(credentials, req) {

        if (typeof credentials?.email !== 'string' || typeof credentials?.password !== 'string') {
          throw new Error("Invalid credentials: Email and password must be provided."); // Or return null if you prefer to handle it differently
        }

        const ip = req.headers?.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown"
        const userAgent = req.headers?.get("user-agent") || "unknown"

        return QUERIES.authenticateUser(
          credentials.email,
          credentials.password,
          ip,
          userAgent
        )
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
})

