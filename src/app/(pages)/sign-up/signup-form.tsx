// "use client";

// import { useState } from "react";
// import { useForm } from "react-hook-form";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { useMutation } from "@tanstack/react-query";
// import { z } from "zod";
// import { useRouter } from 'next/navigation';
// import {
//   Form,
//   FormControl,
//   FormField,
//   FormItem,
//   FormLabel,
//   FormMessage,
// } from "@/components/ui/form";
// import { Input } from "@/components/ui/input";
// import { Button } from "@/components/ui/button";
// import { useToast } from "@/hooks/use-toast";
// import { UserType, userTypes } from "@/lib/types"; // Assuming you have userTypes defined
// import { FormSelectField } from "@/components/form/form-select-field";


// // Define a schema for signup form validation
// const signupSchema = z.object({
//   email: z.string().email({ message: "Invalid email address" }),
//   password: z.string().min(6, { message: "Password must be at least 6 characters" }),
//   firstName: z.string().min(1, { message: "First name is required" }),
//   lastName: z.string().min(1, { message: "Last name is required" }),
//   userType: z.nativeEnum(UserType), // Validate against UserType enum
// });

// type SignupInputType = z.infer<typeof signupSchema>;

// export function SignupForm() {
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const router = useRouter();
//   const { toast } = useToast();
//   const form = useForm<SignupInputType>({
//     resolver: zodResolver(signupSchema),
//     defaultValues: {
//       email: "",
//       password: "",
//       firstName: "",
//       lastName: "",
//       userType: UserType.CUSTOMER, // Default user type
//     },
//     mode: "onSubmit",
//   });

//   const { mutate: signupMutation } = useMutation({
//     mutationFn: async (values: SignupInputType) => {
//       setIsSubmitting(true);
//       const response = await fetch('/api/auth/signup', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify(values),
//       });

//       // Consume response.json() only once
//       const responseData = await response.json();

//       if (!response.ok) {
//         const errorMessage = responseData?.error_message || "Signup lllllll";
//         console.error("Signup failed:", errorMessage);
//         throw new Error(errorMessage);
//       }

//       return responseData; // Return already parsed JSON
//     },
//     onSuccess: (data) => {
//       setIsSubmitting(false);
//       console.log("Signup successful for user ID:", data.user_id);
//       toast({
//         title: "Signup successful",
//         description: "You have successfully signed up.",
//       });
//       router.push('/login'); // Redirect to login page after signup
//     },
//     onError: (error) => {
//       setIsSubmitting(false);
//       toast({
//         variant: "destructive",
//         title: "Signup failed",
//         description: error.message || "An unexpected error occurred during signup.",
//       });
//     },
//   });

//   function onSubmit(values: SignupInputType) {
//     signupMutation(values);
//   }

//   return (
//     <Form {...form}>
//       <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
//         <FormField
//           control={form.control}
//           name="email"
//           render={({ field }) => (
//             <FormItem>
//               <FormLabel>Email</FormLabel>
//               <FormControl>
//                 <Input placeholder="example@email.com" {...field} />
//               </FormControl>
//               <FormMessage />
//             </FormItem>
//           )}
//         />
//         <FormField
//           control={form.control}
//           name="password"
//           render={({ field }) => (
//             <FormItem>
//               <FormLabel>Password</FormLabel>
//               <FormControl>
//                 <Input type="password" {...field} />
//               </FormControl>
//               <FormMessage />
//             </FormItem>
//           )}
//         />
//         <FormField
//           control={form.control}
//           name="firstName"
//           render={({ field }) => (
//             <FormItem>
//               <FormLabel>First Name</FormLabel>
//               <FormControl>
//                 <Input placeholder="John" {...field} />
//               </FormControl>
//               <FormMessage />
//             </FormItem>
//           )}
//         />
//         <FormField
//           control={form.control}
//           name="lastName"
//           render={({ field }) => (
//             <FormItem>
//               <FormLabel>Last Name</FormLabel>
//               <FormControl>
//                 <Input placeholder="Doe" {...field} />
//               </FormControl>
//               <FormMessage />
//             </FormItem>
//           )}
//         />
//         <FormSelectField
//           control={form.control}
//           name="userType"
//           label="User Type"
//           options={userTypes} // Assuming userTypes is an array of {label: string, value: string}
//         />

//         <Button type="submit" disabled={isSubmitting}>
//           {isSubmitting ? "Signing up..." : "Sign Up"}
//         </Button>
//       </form>
//     </Form>
//   );
// } 

export default function SignupForm() {
  return (
    <div>signUp</div>
  );
}