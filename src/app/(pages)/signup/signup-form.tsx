"use client"
import { useState, useTransition } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { signUpSchema, SignUpValues } from "@/lib/validations/auth"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { signUp } from "@/server/actions/signup"
import { redirect } from "next/navigation"
import { CheckCircleIcon, XCircleIcon } from "lucide-react"
import { cn } from "@/lib/utils" // Assuming you have a utils file with cn

// export  function SignupForm() {
//   const [isPending, startTransition] = useTransition()
//   const [formMessage, setFormMessage] = useState<{ type: 'success' | 'error' | null, message: string | null }>({ type: null, message: null });
//   const [passwordCriteria, setPasswordCriteria] = useState({
//     minLength: false,
//     uppercase: false,
//     lowercase: false,
//     number: false,
//     specialChar: false,
//   });
//   const [showPasswordAnalysis, setShowPasswordAnalysis] = useState(false);

//   const form = useForm<SignUpValues>({
//     resolver: zodResolver(signUpSchema),
//     defaultValues: {
//       firstName: "",
//       lastName: "",
//       email: "",
//       password: "",
//       userType: "CUSTOMER",
//     },
//   })

//   const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#\$%\^&\*])(?=.{8,})/;


//   const checkPasswordStrength = (password: string) => {
//     setPasswordCriteria({
//       minLength: password.length >= 8,
//       uppercase:  /(?=.*[A-Z])/.test(password),
//       lowercase:  /(?=.*[a-z])/.test(password),
//       number:     /(?=.*\d)/.test(password),
//       specialChar:/(?=.*[!@#\$%\^&\*])/.test(password),
//     });
//     if (password.length > 0) {
//       setShowPasswordAnalysis(true);
//     } else {
//       setShowPasswordAnalysis(false);
//     }
//   };

//   const allCriteriaMet = () => {
//     return Object.values(passwordCriteria).every(Boolean);
//   };

//   function onSubmit(values: SignUpValues) {
//     setFormMessage({ type: null, message: null });
//     startTransition(async () => {
//       const result = await signUp(values)
//       if (result.success) {
//         setFormMessage({ type: 'success', message: result.message!+' Redirecting to login page' });
//         form.reset()
//         await new Promise((resolve) => setTimeout(resolve, 2000))
//         redirect('/login')

//       } else {
//         if (result.message) {
//           setFormMessage({ type: 'error', message: result.message });
//         } else {
//           setFormMessage({ type: null, message: null });
//         }
//         Object.entries(result.errors || {}).forEach(([key, value]) => {
//           form.setError(key as keyof SignUpValues, {
//             type: "manual",
//             message: value as unknown as string,
//           })
//         })
//       }
//     })
//   }

//   return (
//     <div className="min-h-screen bg-gray-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
//       <Card className="w-full max-w-md mx-auto">
//         <CardHeader>
//           <CardTitle className="text-2xl font-bold text-center">Create your account</CardTitle>
//           <CardDescription className="text-center">Enter your information to sign up</CardDescription>
//         </CardHeader>
//         <CardContent>
//           <Form {...form}>
//             <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
//               <div className="grid grid-cols-2 gap-4">
//                 <FormField
//                   control={form.control}
//                   name="firstName"
//                   render={({ field }) => (
//                     <FormItem>
//                       <FormLabel>First name</FormLabel>
//                       <FormControl>
//                         <Input {...field} />
//                       </FormControl>
//                       <FormMessage />
//                     </FormItem>
//                   )}
//                 />
//                 <FormField
//                   control={form.control}
//                   name="lastName"
//                   render={({ field }) => (
//                     <FormItem>
//                       <FormLabel>Last name</FormLabel>
//                       <FormControl>
//                         <Input {...field} />
//                       </FormControl>
//                       <FormMessage />
//                     </FormItem>
//                   )}
//                 />
//               </div>
//               <FormField
//                 control={form.control}
//                 name="email"
//                 render={({ field }) => (
//                   <FormItem>
//                     <FormLabel>Email</FormLabel>
//                     <FormControl>
//                       <Input type="email" {...field} />
//                     </FormControl>
//                     <FormMessage />
//                   </FormItem>
//                 )}
//               />
//               <FormField
//                 control={form.control}
//                 name="password"
//                 render={({ field }) => (
//                   <FormItem>
//                     <FormLabel>Password</FormLabel>
//                     <FormControl>
//                       <Input
//                         type="password"
//                         {...field}
//                         onFocus={() => setShowPasswordAnalysis(true)}
//                         onChange={(e) => {
//                           field.onChange(e);
//                           checkPasswordStrength(e.target.value);
//                         }}
//                       />
//                     </FormControl>
//                     <FormMessage />
//                   </FormItem>
//                 )}
//               />

//               {/* Animated Password Criteria Checklist */}
//               <div className="mt-2 overflow-hidden transition-all duration-300 ease-in-out" style={{ maxHeight: showPasswordAnalysis && !allCriteriaMet() ? '500px' : '0px' }}>
//                 <div className="space-y-2 ">
//                   <FormLabel className="text-sm font-medium">Password must contain:</FormLabel>
//                   <ul className="list-none pl-0 ml-0 space-y-1">
//                     <li className={cn("flex items-center", passwordCriteria.minLength ? "text-green-500" : "text-gray-500")}>
//                       {passwordCriteria.minLength ? <CheckCircleIcon className="mr-2 h-4 w-4" /> : <XCircleIcon className="mr-2 h-4 w-4 text-red-500" />}
//                       At least 8 characters
//                     </li>
//                     <li className={cn("flex items-center", passwordCriteria.uppercase ? "text-green-500" : "text-gray-500")}>
//                       {passwordCriteria.uppercase ? <CheckCircleIcon className="mr-2 h-4 w-4" /> : <XCircleIcon className="mr-2 h-4 w-4 text-red-500" />}
//                       One uppercase letter
//                     </li>
//                     <li className={cn("flex items-center", passwordCriteria.lowercase ? "text-green-500" : "text-gray-500")}>
//                       {passwordCriteria.lowercase ? <CheckCircleIcon className="mr-2 h-4 w-4" /> : <XCircleIcon className="mr-2 h-4 w-4 text-red-500" />}
//                       One lowercase letter
//                     </li>
//                     <li className={cn("flex items-center", passwordCriteria.number ? "text-green-500" : "text-gray-500")}>
//                       {passwordCriteria.number ? <CheckCircleIcon className="mr-2 h-4 w-4" /> : <XCircleIcon className="mr-2 h-4 w-4 text-red-500" />}
//                       One number
//                     </li>
//                     <li className={cn("flex items-center", passwordCriteria.specialChar ? "text-green-500" : "text-gray-500")}>
//                       {passwordCriteria.specialChar ? <CheckCircleIcon className="mr-2 h-4 w-4" /> : <XCircleIcon className="mr-2 h-4 w-4 text-red-500" />}
//                       One special symbol (!@#$%^&*)
//                     </li>
//                   </ul>
//                 </div>
//               </div>


//               <FormField
//                 control={form.control}
//                 name="userType"
//                 render={({ field }) => (
//                   <FormItem>
//                     <FormLabel>User type</FormLabel>
//                     <FormControl>
//                       <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex space-x-4">
//                         <FormItem className="flex items-center space-x-2">
//                           <FormControl>
//                             <RadioGroupItem value="EMPLOYEE" />
//                           </FormControl>
//                           <FormLabel className="font-normal">Employee</FormLabel>
//                         </FormItem>
//                         <FormItem className="flex items-center space-x-2">
//                           <FormControl>
//                             <RadioGroupItem value="CUSTOMER" />
//                           </FormControl>
//                           <FormLabel className="font-normal">Customer</FormLabel>
//                         </FormItem>
//                         <FormItem className="flex items-center space-x-2">
//                           <FormControl>
//                             <RadioGroupItem value="DEMO" />
//                           </FormControl>
//                           <FormLabel className="font-normal">Demo</FormLabel>
//                         </FormItem>
//                       </RadioGroup>
//                     </FormControl>
//                     <FormMessage />
//                   </FormItem>
//                 )}
//               />
//               <Button type="submit" className="w-full" disabled={isPending}>
//                 {isPending ? "Signing up..." : "Sign Up"}
//               </Button>
//             </form>
//           </Form>
//           {formMessage.message && (
//             <div className={`mt-6 p-4 border-l-4 ${formMessage.type === 'success' ? 'bg-green-50 border-green-400' : 'bg-red-50 border-red-400'}`}>
//               <div className="flex">
//                 <div className="flex-shrink-0">
//                   {formMessage.type === 'success' ? (
//                     <CheckCircleIcon className="h-5 w-5 text-green-400" aria-hidden="true" />
//                   ) : (
//                     <XCircleIcon className="h-5 w-5 text-red-400" aria-hidden="true" />
//                   )}
//                 </div>
//                 <div className="ml-3">
//                   <p className={`text-sm font-medium ${formMessage.type === 'success' ? 'text-green-800' : 'text-red-800'}`}>{formMessage.message}</p>
//                 </div>
//               </div>
//             </div>
//           )}
//         </CardContent>
//       </Card>
//     </div>
//   )
// }

// import { useState, useTransition } from "react"
// import { useForm } from "react-hook-form"
// import { zodResolver } from "@hookform/resolvers/zod"
// import { signUpSchema, SignUpValues } from "@/lib/validations/auth"
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
// import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
// import { Input } from "@/components/ui/input"
// import { Button } from "@/components/ui/button"
// import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
// import { signUp } from "@/lib/actions/auth-actions"
// import { redirect } from "next/navigation"
// import { CheckCircleIcon, XCircleIcon } from "lucide-react"
// import { cn } from "@/lib/utils" // Assuming you have a utils file with cn

export  function SignupForm() {
  const [isPending, startTransition] = useTransition()
  const [formMessage, setFormMessage] = useState<{ type: 'success' | 'error' | null, message: string | null }>({ type: null, message: null });
  const [passwordCriteria, setPasswordCriteria] = useState({
    minLength: false,
    uppercase: false,
    lowercase: false,
    number: false,
    specialChar: false,
  });
  const [showPasswordAnalysis, setShowPasswordAnalysis] = useState(false);

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

  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#\$%\^&\*])(?=.{8,})/;


  const checkPasswordStrength = (password: string) => {
    setPasswordCriteria({
      minLength: password.length >= 8,
      uppercase:  /(?=.*[A-Z])/.test(password),
      lowercase:  /(?=.*[a-z])/.test(password),
      number:     /(?=.*\d)/.test(password),
      specialChar:/(?=.*[!@#\$%\^&\*])/.test(password),
    });
  };

  const allCriteriaMet = () => {
    return Object.values(passwordCriteria).every(Boolean);
  };

  function onSubmit(values: SignUpValues) {
    setFormMessage({ type: null, message: null });
    startTransition(async () => {
      const result = await signUp(values)
      if (result.success) {
        setFormMessage({ type: 'success', message: result.message!+' Redirecting to login page' });
        form.reset()
        await new Promise((resolve) => setTimeout(resolve, 2000))
        redirect('/login')

      } else {
        if (result.message) {
          setFormMessage({ type: 'error', message: result.message });
        } else {
          setFormMessage({ type: null, message: null });
        }
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
                      <Input
                        type="password"
                        {...field}
                        onBlur={(e) => { // Show analysis on blur (when user moves away)
                          checkPasswordStrength(e.target.value);
                          if (e.target.value.length > 0) {
                            setShowPasswordAnalysis(true);
                          } else {
                            setShowPasswordAnalysis(false);
                          }
                        }}
                        onChange={(e) => {
                          field.onChange(e);
                          checkPasswordStrength(e.target.value); // No real-time check anymore
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Animated Password Criteria Checklist */}
              <div className="mt-2 overflow-hidden transition-all duration-500 ease-in-out" style={{ maxHeight: showPasswordAnalysis && !allCriteriaMet() ? '500px' : '0px' }}>
                <div className="space-y-2 ">
                  <FormLabel className="text-sm font-medium">Password must contain:</FormLabel>
                  <ul className="list-none pl-0 ml-0 space-y-0">
                    <li className={cn("flex items-center", passwordCriteria.minLength ? "text-green-500" : "text-gray-500")}>
                      {passwordCriteria.minLength ? <CheckCircleIcon className="mr-2 h-4 w-4" /> : <XCircleIcon className="mr-2 h-4 w-4 text-red-500" />}
                      At least 8 characters
                    </li>
                    <li className={cn("flex items-center", passwordCriteria.uppercase ? "text-green-500" : "text-gray-500")}>
                      {passwordCriteria.uppercase ? <CheckCircleIcon className="mr-2 h-4 w-4" /> : <XCircleIcon className="mr-2 h-4 w-4 text-red-500" />}
                      One uppercase letter
                    </li>
                    <li className={cn("flex items-center", passwordCriteria.lowercase ? "text-green-500" : "text-gray-500")}>
                      {passwordCriteria.lowercase ? <CheckCircleIcon className="mr-2 h-4 w-4" /> : <XCircleIcon className="mr-2 h-4 w-4 text-red-500" />}
                      One lowercase letter
                    </li>
                    <li className={cn("flex items-center", passwordCriteria.number ? "text-green-500" : "text-gray-500")}>
                      {passwordCriteria.number ? <CheckCircleIcon className="mr-2 h-4 w-4" /> : <XCircleIcon className="mr-2 h-4 w-4 text-red-500" />}
                      One number
                    </li>
                    <li className={cn("flex items-center", passwordCriteria.specialChar ? "text-green-500" : "text-gray-500")}>
                      {passwordCriteria.specialChar ? <CheckCircleIcon className="mr-2 h-4 w-4" /> : <XCircleIcon className="mr-2 h-4 w-4 text-red-500" />}
                      One special symbol (!@#$%^&*)
                    </li>
                  </ul>
                </div>
              </div>

                <div className="bg-purple-200 p-1 rounded-md text-center items-center justify-center">
                DEV ONLY

              <FormField
                control={form.control}
                name="userType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>User type</FormLabel>
                    <FormControl>
                      <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex space-x-4 ">
                        <FormItem className="flex items-center space-x-2 ">
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
              </div>
              <Button type="submit" className="w-full" disabled={isPending}>
                {isPending ? "Signing up..." : "Sign Up"}
              </Button>
            </form>
          </Form>
          {formMessage.message && (
            <div className={`mt-6 p-4 border-l-4 ${formMessage.type === 'success' ? 'bg-green-50 border-green-400' : 'bg-red-50 border-red-400'}`}>
              <div className="flex">
                <div className="flex-shrink-0">
                  {formMessage.type === 'success' ? (
                    <CheckCircleIcon className="h-5 w-5 text-green-400" aria-hidden="true" />
                  ) : (
                    <XCircleIcon className="h-5 w-5 text-red-400" aria-hidden="true" />
                  )}
                </div>
                <div className="ml-3">
                  <p className={`text-sm font-medium ${formMessage.type === 'success' ? 'text-green-800' : 'text-red-800'}`}>{formMessage.message}</p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}