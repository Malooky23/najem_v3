// "use client"


// import { ComboboxForm } from "@/components/ui/combobox"
// import { Form } from "@/components/ui/form"
// import { useForm } from "react-hook-form"
// import { useSession } from "next-auth/react"
// export default function TestPage() {
//   const { data: session } = useSession()
//   const form = useForm({
//     defaultValues: {
//       test: ""
//     }
//   })

//   // Generate a large number of test options
//   const testOptions = Array.from({ length: 50 }, (_, i) => ({
//     label: `Test Option ${i + 1}`,
//     value: `value-${i + 1}`
//   }))

//   return (
//     <div className="container mx-auto p-8">
//       <h1 className="text-2xl font-bold mb-4">Combobox Test Page</h1>
//       <p>{session ? `Welcome, ${session.user.name}` : "Please sign in."}</p>
//       <div className="max-w-md">
//         <Form {...form}>
//           <ComboboxForm
//             name="test"
//             label="Test Combobox"
//             options={testOptions}
//             placeholder="Select a test option..."
//           />
//         </Form>
//       </div>
//     </div>
//   )
// }


import { auth } from "@/lib/auth/auth"

export default async function TestPage() {

  const session = await auth()
  return(
    <div>
      <h1>Test Page</h1>
      <p>{session ? `Welcome, ${session.user.name}` : "Please sign in."}</p>
      <p>This is a test page</p>
    </div>
  )
}