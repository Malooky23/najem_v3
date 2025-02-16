
"use server"
import { z } from 'zod'
import { db } from '@/server/db'
import { sql } from 'drizzle-orm'


const signUpSchema = z.object({
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    userType: z.enum(["EMPLOYEE", "CUSTOMER", "DEMO"]).default("CUSTOMER"),
})
type SignUpValues = z.infer<typeof signUpSchema>

interface NewUserResponse{
    success: boolean,
    user_id?: string,
    error_code?:string,
    error_message?:string
}

export async function signUp(values: SignUpValues) {
    // Validate the input
    const result = signUpSchema.safeParse(values)

    if (!result.success) {
        // If validation fails, return the errors
        return { success: false, errors: result.error.flatten().fieldErrors }
    }

    // Simulate a delay to show pending state

    const dbAction = await db.execute<{ new_user: NewUserResponse }>(
        sql`SELECT new_user(
          ${result.data.email}::TEXT,
          ${result.data.password}::TEXT,
          ${result.data.firstName}::VARCHAR(50),
          ${result.data.lastName}::VARCHAR(50),
          ${result.data.userType}::user_type
        )`
    );
    const signupResult = dbAction.rows[0].new_user;

    if (!signupResult?.success) {
        return ({ success: false, message: signupResult?.error_message || "Signup Failed" } );
    }

    return ({ success: true,message: "Signup successful!", user_id: signupResult?.user_id });

    // // Log form values
    // console.log("Form values:", result.data)

    // // Return a success message
    // return { success: true, message: "Signup successful!", user: result.data }
}

