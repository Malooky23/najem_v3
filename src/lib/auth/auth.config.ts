// import Credentials from "next-auth/providers/credentials"
// import { CredentialsSignin, type NextAuthConfig } from "next-auth"
// import { DatabaseError, InvalidCredentialsError, MissingCredentialsError, UserNotFoundError } from "./errors"
// import { QUERIES } from "@/server/db/queries"
 
// // Notice this is only an object, not a full Auth.js instance
// export default {
//     // providers: [
//     //     Credentials
//     //     ({
//     //       async authorize(credentials, req) {
//     //         try {
//     //           if (typeof credentials?.email !== 'string' || typeof credentials?.password !== 'string') {
//     //             throw new MissingCredentialsError()
//     //           }
    
//     //           const ip = req.headers?.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown"
//     //           const userAgent = req.headers?.get("user-agent") || "unknown"
    
//     //           try {
//     //             const result = await QUERIES.authenticateUser(
//     //               credentials.email,
//     //               credentials.password,
//     //               ip,
//     //               userAgent
//     //             )
    
//     //             if (!result) {
//     //               throw new InvalidCredentialsError()
//     //             }
    
//     //             return result
//     //           } catch (error) {
//     //             if (error instanceof Error) {
//     //               switch (error.message) {
//     //                 case "USER_NOT_FOUND":
//     //                   throw new UserNotFoundError()
//     //                 case "DATABASE_ERROR":
//     //                   throw new DatabaseError()
//     //                 default:
//     //                   throw new InvalidCredentialsError()
//     //               }
//     //             }
//     //             throw new InvalidCredentialsError()
//     //           }
//     //         } catch (error) {
//     //           if (error instanceof CredentialsSignin) {
//     //             throw error
//     //           }
//     //           throw new InvalidCredentialsError()
//     //         }
//     //       },
//     //     }),
//     //   ],
//     // providers:[]
//     } satisfies NextAuthConfig