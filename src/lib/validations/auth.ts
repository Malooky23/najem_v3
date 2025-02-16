// import { z } from "zod"

export const signUpSchema = z.object({
  firstName: z.string().min(2, "First name is required"),
  lastName: z.string().min(2, "Last name is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  userType: z.enum(["EMPLOYEE", "CUSTOMER", "DEMO"]).default("CUSTOMER"),
})

// export type SignUpValues = z.infer<typeof signUpSchema>

import * as z from "zod"

// export const signUpSchema = z.object({
//   firstName: z.string()
//     .min(2, { message: "First name must be at least 2 characters" }) // More specific minLength message
//     .regex(/^[a-zA-Z\s]+$/, {
//       message: "First name must only contain letters and spaces", // More user-friendly regex message
//     }),
//   lastName: z.string()
//     .min(2, { message: "Last name must be at least 2 characters" }) // More specific minLength message
//     .regex(/^[a-zA-Z\s]+$/, {
//       message: "Last name must only contain letters and spaces", // More user-friendly regex message
//     }),
//   email: z.string().email({ message: "Please enter a valid email address" }), // More user-friendly email message
//   password: z.string()
//     .min(8, { message: "Password must be at least 8 characters long" }) // More specific password minLength message
//     .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#\$%\^&\*])(?=.{8,})/, { // Stronger password regex
//       message: "Password must be at least 8 characters and include uppercase, lowercase, number and special symbol"
//     }),
//   userType: z.enum(["EMPLOYEE", "CUSTOMER", "DEMO"]).default("CUSTOMER"),
// })

export type SignUpValues = z.infer<typeof signUpSchema>