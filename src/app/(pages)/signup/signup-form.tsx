// // // "use client";

// // // import { useRouter } from 'next/navigation';
// // // import { useEffect } from 'react';
// // // import { useFormStatus } from 'react-dom';
// // // import { useActionState } from 'react';
// // // import { Button } from "@/components/ui/button";
// // // import { Input } from "@/components/ui/input";
// // // import { Label } from "@/components/ui/label";
// // // import { useToast } from "@/hooks/use-toast";
// // // import { signupAction } from "@/app/actions/auth/signup";
// // // import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
// // // import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
// // // import { Link } from 'lucide-react';

// // // const USER_TYPE_OPTIONS = [
// // //   { value: "EMPLOYEE", label: "Employee" },
// // //   { value: "CUSTOMER", label: "Customer" },
// // //   { value: "DEMO", label: "Demo" }
// // // ];

// // // function SubmitButton() {
// // //   const { pending } = useFormStatus();
// // //   return (
// // //     <Button type="submit" disabled={pending}>
// // //       {pending ? "Signing up..." : "Sign Up"}
// // //     </Button>
// // //   );
// // // }

// // // export function SignupForm() {
// // //   const router = useRouter();
// // //   const { toast } = useToast();
// // //   const [state, formAction] = useActionState(signupAction, null);

// // //   useEffect(() => {
// // //     if (state?.error) {
// // //       toast({
// // //         variant: "destructive",
// // //         title: "Signup failed",
// // //         description: state.error,
// // //       });
// // //     } else if (state?.success) {
// // //       toast({
// // //         title: "Signup successful",
// // //         description: state.message,
// // //       });
// // //       router.push('/login');
// // //     }
// // //   }, [state, toast, router]);

// //   // return (
// //   // <form action={formAction} className="space-y-4">
// //   //   <div className="space-y-2">
// //   //     <Label htmlFor="email">Email</Label>
// //   //     <Input
// //   //       id="email"
// //   //       name="email"
// //   //       type="email"
// //   //       placeholder="example@email.com"
// //   //       required
// //   //     />
// //   //   </div>

// //   //   <div className="space-y-2">
// //   //     <Label htmlFor="password">Password</Label>
// //   //     <Input
// //   //       id="password"
// //   //       name="password"
// //   //       type="password"
// //   //       required
// //   //     />
// //   //   </div>

// //   //   <div className="space-y-2">
// //   //     <Label htmlFor="firstName">First Name</Label>
// //   //     <Input
// //   //       id="firstName"
// //   //       name="firstName"
// //   //       placeholder="John"
// //   //       required
// //   //     />
// //   //   </div>

// //   //   <div className="space-y-2">
// //   //     <Label htmlFor="lastName">Last Name</Label>
// //   //     <Input
// //   //       id="lastName"
// //   //       name="lastName"
// //   //       placeholder="Doe"
// //   //       required
// //   //     />
// //   //   </div>

// //   //   <div className="space-y-2">
// //   //     <Label htmlFor="userType">User Type</Label>
// //   //     <SelectContent 
// //   //       id="userType"
// //   //       name="userType"
// //   //       className="w-full p-2 border rounded-md"
// //   //       defaultValue="CUSTOMER"
// //   //     >
// //   //       {USER_TYPE_OPTIONS.map(option => (
// //   //         <SelectItem key={option.value} value={option.value}>
// //   //           {option.label}
// //   //         </SelectItem>
// //   //       ))}
// //   //     </SelectContent>
// //   //   </div>

// //   //   <SubmitButton />
// //   // </form>
// //   // );
// //   // }
  
// //   "use client"

// // import Link from "next/link"
// // import { zodResolver } from "@hookform/resolvers/zod"
// // import { useForm } from "react-hook-form"
// // import { z } from "zod"

// // import { toast } from "@/hooks/use-toast"
// // import { Button } from "@/components/ui/button"
// // import {
// //   Form,
// //   FormControl,
// //   FormDescription,
// //   FormField,
// //   FormItem,
// //   FormLabel,
// //   FormMessage,
// // } from "@/components/ui/form"
// // import {
// //   Select,
// //   SelectContent,
// //   SelectItem,
// //   SelectTrigger,
// //   SelectValue,
// // } from "@/components/ui/select"

// // const FormSchema = z.object({
// //   email: z
// //     .string({
// //       required_error: "Please select an email to display.",
// //     })
// //     .email(),
// // })

// // export function SignupForm() {
// //   const form = useForm<z.infer<typeof FormSchema>>({
// //     resolver: zodResolver(FormSchema),
// //   })

// //   function onSubmit(data: z.infer<typeof FormSchema>) {
// //     toast({
// //       title: "You submitted the following values:",
// //       description: (
// //         <pre className="mt-2 w-[340px] rounded-md bg-slate-950 p-4">
// //           <code className="text-white">{JSON.stringify(data, null, 2)}</code>
// //         </pre>
// //       ),
// //     })
// //   }

// //   return (
// //     <Form {...form}>
// //       <form onSubmit={form.handleSubmit(onSubmit)} className="w-2/3 space-y-6">
// //         <FormField
// //           control={form.control}
// //           name="email"
// //           render={({ field }) => (
// //             <FormItem>
// //               <FormLabel>Email</FormLabel>
// //               <Select onValueChange={field.onChange} defaultValue={field.value}>
// //                 <FormControl>
// //                   <SelectTrigger>
// //                     <SelectValue placeholder="Select a verified email to display" />
// //                   </SelectTrigger>
// //                 </FormControl>
// //                 <SelectContent>
// //                   <SelectItem value="m@example.com">m@example.com</SelectItem>
// //                   <SelectItem value="m@google.com">m@google.com</SelectItem>
// //                   <SelectItem value="m@support.com">m@support.com</SelectItem>
// //                 </SelectContent>
// //               </Select>
// //               <FormDescription>
// //                 You can manage email addresses in your{" "}
// //                 <Link href="/examples/forms">email settings</Link>.
// //               </FormDescription>
// //               <FormMessage />
// //             </FormItem>
// //           )}
// //         />
// //         <Button type="submit">Submit</Button>
// //       </form>
// //     </Form>
// //   )
// // }


// "use client"

// import { useActionState } from "react"
// import { signUp } from "./actions"
// import { useState } from "react"

// const initialState = {
//   message: "",
// }

// export function SignupForm() {
//   const [state, formAction, pending] = useActionState(signUp, initialState)
//   const [errors, setErrors] = useState<{ [key: string]: string }>({})

//   const validateForm = (formData: FormData) => {
//     const newErrors: { [key: string]: string } = {}

//     const email = formData.get("email") as string
//     const password = formData.get("password") as string

//     if (!email) {
//       newErrors.email = "Email is required"
//     } else if (!/\S+@\S+\.\S+/.test(email)) {
//       newErrors.email = "Email is invalid"
//     }

//     if (!password) {
//       newErrors.password = "Password is required"
//     } else if (password.length < 6) {
//       newErrors.password = "Password must be at least 6 characters"
//     }

//     setErrors(newErrors)

//     return Object.keys(newErrors).length === 0
//   }

//   return (
//     <div className="max-w-md mx-auto mt-10">
//       <form
//         action={async (formData: FormData) => {
//           if (validateForm(formData)) {
//              formAction(formData)
//           }
//         }}
//         className="space-y-4"
//       >
//         <div>
//           <label htmlFor="email" className="block mb-1">
//             Email
//           </label>
//           <input type="email" id="email" name="email" className="w-full px-3 py-2 border rounded" />
//           {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
//         </div>
//         <div>
//           <label htmlFor="password" className="block mb-1">
//             Password
//           </label>
//           <input type="password" id="password" name="password" className="w-full px-3 py-2 border rounded" />
//           {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
//         </div>
//         <button
//           type="submit"
//           disabled={pending}
//           className="w-full bg-blue-500 text-white py-2 rounded disabled:bg-blue-300"
//         >
//           {pending ? "Signing up..." : "Sign Up"}
//         </button>
//       </form>
//       {state.message && <p className="mt-4 text-green-500 text-center">{state.message}</p>}
//     </div>
//   )
// }

"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { signUp } from "./actions"
import { useTransition } from "react"
// import { CheckCircleIcon } from "@heroicons/react/24/solid"
import { CheckCircle2 as CheckCircleIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {z} from "zod"
import { redirect } from "next/navigation"

export const signUpSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  userType: z.enum(["EMPLOYEE", "CUSTOMER", "DEMO"]).default("CUSTOMER"),
})

export type SignUpValues = z.infer<typeof signUpSchema>




export  function SignupForm() {
  const [isPending, startTransition] = useTransition()
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const form = useForm<SignUpValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      userType: "CUSTOMER",
    },
  })

  function onSubmit(values: SignUpValues) {
    setSuccessMessage(null)
    startTransition(async () => {
      const result = await signUp(values)
      if (result.success) {
        setSuccessMessage(result.message!+' Redirecting to login page')
        form.reset()
        await new Promise((resolve) => setTimeout(resolve, 2000))
        redirect('/login')

      } else {
        // Handle errors
        Object.entries(result.errors || {}).forEach(([key, value]) => {
          form.setError(key as keyof SignUpValues, {
            type: "manual",
            message: value as unknown as string,
          })
        })
      }
    })
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">Create your account</CardTitle>
          <CardDescription className="text-center">Enter your information to sign up</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Last name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="userType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>User type</FormLabel>
                    <FormControl>
                      <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex space-x-4">
                        <FormItem className="flex items-center space-x-2">
                          <FormControl>
                            <RadioGroupItem value="EMPLOYEE" />
                          </FormControl>
                          <FormLabel className="font-normal">Employee</FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-2">
                          <FormControl>
                            <RadioGroupItem value="CUSTOMER" />
                          </FormControl>
                          <FormLabel className="font-normal">Customer</FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-2">
                          <FormControl>
                            <RadioGroupItem value="DEMO" />
                          </FormControl>
                          <FormLabel className="font-normal">Demo</FormLabel>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={isPending}>
                {isPending ? "Signing up..." : "Sign Up"}
              </Button>
            </form>
          </Form>
          {successMessage && (
            <div className="mt-6 bg-green-50 border-l-4 border-green-400 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <CheckCircleIcon className="h-5 w-5 text-green-400" aria-hidden="true" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-green-800">{successMessage}</p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

