// "use client"

// import { Plus, Mail, Phone, X, Delete, Trash2 } from "lucide-react"
// import { useCallback } from "react"
// import { Button } from "@/components/ui/button"
// import { Input } from "@/components/ui/input"
// import { Label } from "@/components/ui/label"
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
// import { Switch } from "@/components/ui/switch"
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
// import type { FieldArrayWithId, Control, UseFormSetValue, UseFormWatch, FormState } from "react-hook-form"
// import { z } from "zod"
// import { contactSchema, contactsArraySchema } from "@/lib/validations/contact"

// export const CONTACT_TYPE_OPTIONS = [
//     { value: "email" as const, label: "Email" },
//     { value: "phone" as const, label: "Phone" }
//   ] as const;
  
// type ContactType = (typeof CONTACT_TYPE_OPTIONS)[number]["value"]

// export type ContactFormData = {
//   contacts: z.infer<typeof contactsArraySchema>
// }

// const contactValidation = {
//   email: (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) || 'Invalid email address',
//   phone: (value: string) => /^\+?[\d\s-]{7,}$/.test(value) || 'Invalid phone number'
// };

// type ContactsSectionProps = {
//   fields: FieldArrayWithId<ContactFormData, "contacts", "id">[]
//   append: (value: { data: string; type: ContactType; isPrimary: boolean }) => void
//   remove: (index: number) => void
//   setValue: UseFormSetValue<ContactFormData>
//   watch: UseFormWatch<ContactFormData>
//   formState: FormState<ContactFormData>
//   control: Control<ContactFormData>
// }

// export function ContactsSection({ fields, append, remove, setValue, watch, formState, control }: ContactsSectionProps) {
//   const detectContactType = useCallback((value: string): ContactType => {
//     const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
//     const phoneRegex = /^\+?[\d\s-]{7,}$/

//     if (emailRegex.test(value)) return "email"
//     if (phoneRegex.test(value)) return "phone"
//     return "email"
//   }, [])

//   return (
//     // <Card className="w-full max-w-2xl">
//     <div className="max-h-[400px] overflow-auto">
//       {/* <CardHeader className="flex flex-row items-center justify-between "> */}
//         {/* <CardTitle className="text-xl font-bold">
//           Contact Information <span className="text-red-500">*</span>
//         </CardTitle> */}
//         <Label htmlFor="businessName">Contact Information <span className="text-red-500">*</span></Label>


//       {/* </CardHeader> */}
//       {/* <CardContent> */}
//         {fields.map((field, index) => (
//           <div key={field.id} className="mb-6 last:mb-0">
//             <div className="grid gap-4 sm:grid-cols-[1fr,auto,auto,auto] items-center">
//               <div className="relative">
//                 <Input
//                   {...control.register(`contacts.${index}.data`, {
//                     required: "Contact information is required",
//                   })}
//                   onChange={(e) => {
//                     control.register(`contacts.${index}.data`).onChange(e);
//                     const type = detectContactType(e.target.value);
//                     setValue(`contacts.${index}.type`, type);
//                   }}
//                   placeholder="email@example.com or +1234567890"
//                   className="pl-10"
//                 />
//                 <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
//                   {watch(`contacts.${index}.type`) === "email" ? (
//                     <Mail className="h-4 w-4 text-muted-foreground" />
//                   ) : (
//                     <Phone className="h-4 w-4 text-muted-foreground" />
//                   )}
//                 </div>
//               </div>
//               <Select
//                 value={watch(`contacts.${index}.type`)}
//                 onValueChange={(value: ContactType) =>
//                   setValue(`contacts.${index}.type`, value)
//                 }
//               >
//                 <SelectTrigger className="w-[120px]">
//                   <SelectValue />
//                 </SelectTrigger>
//                 <SelectContent>
//                   {CONTACT_TYPE_OPTIONS.map((option) => (
//                     <SelectItem key={option.value} value={option.value}>
//                       {option.label}
//                     </SelectItem>
//                   ))}
//                 </SelectContent>
//               </Select>
//               <div className="flex items-center space-x-2">
//                 <Switch
//                   checked={watch(`contacts.${index}.isPrimary`)}
//                   onCheckedChange={(checked) => {
//                     fields.forEach((_, i) => {
//                       setValue(`contacts.${i}.isPrimary`, i === index && checked);
//                     });
//                   }}
//                 />
//                 <Label className="text-sm font-medium">Primary</Label>
//               </div>
//               <Button
//                 type="button"
//                 variant="ghost"
//                 size="icon"
//                 onClick={() => fields.length > 1 && remove(index)}
//                 disabled={fields.length === 1}
//               >
//                 <Trash2 className="h-4 w-4 stroke-red-500" />
//               </Button>
//             </div>
//             {formState.errors.contacts?.[index]?.data && (
//               <p className="text-sm text-red-500 mt-1">
//                 {formState.errors.contacts[index].data?.message as string}
//               </p>
//             )}
//             {index === 0 && formState.errors.contacts && 'root' in formState.errors.contacts && (
//               <p className="text-sm text-red-500 mt-1">
//                 {formState.errors.contacts.root?.message}
//               </p>
//             )}
//           </div>
          
//         ))}
//       {/* </CardContent> */}
//       <Button 
//           type="button"
//           variant="outline" 
//         //   size="icon" 
//           onClick={() => append({ data: "", type: "email", isPrimary: false })}
//         >
//           {/* <Plus className="items-center justify-center" /> */} add more?
//         </Button>

//     {/* </Card> */}
//       </div>
//   )
// }