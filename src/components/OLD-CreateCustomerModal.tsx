// "use client";

// import { useForm } from "react-hook-form";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { Schema, z } from "zod";
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
// } from "@/components/ui/dialog";
// import { Button } from "@/components/ui/button";
// import { Form } from "@/components/ui/form";
// import { FormInputField } from "@/components/form/form-input-field";
// import { FormSwitchField } from "@/components/form/form-switch-field";
// import { FormComboboxField } from "@/components/form/form-combobox-field";
// import { toast } from "@/hooks/use-toast";

// import { ScrollArea } from "@/components/ui/scroll-area";
// import React from "react";
// import { CONTACT_TYPE_OPTIONS } from "@/lib/constants/contact_details";
// import { COUNTRIES } from "@/lib/constants/countries";
// import {
//   InsertIndividualCustomer,
//   InsertBusinessCustomer,
//   InsertAddressDetails,
//   InsertContactDetails,
// } from "@/server/db/schema";
// // import {  createCustomer } from "@/server/db/queries"; // Import the action

// // Zod schema for AddressDetails (matching your Drizzle schema)
// const addressSchema = z.object({
//   address1: z.string().min(1, { message: "Address 1 is required" }),
//   address2: z.string().optional(),
//   city: z.string().min(1, { message: "City is required" }),
//   postalCode: z.string().min(1, { message: "Postal Code is required" }),
//   country: z.string().min(1, { message: "Country is required" }),
//   addressType: z.string().optional(),
// });

// // Zod schema for ContactDetails (matching your Drizzle schema)
// const contactSchema = z.object({
//   contact_type: z.enum(["email", "mobile", "landline", "other"]),
//   contact_data: z.string().min(1, { message: "Contact Data is required" }),
//   is_primary: z.boolean().default(false),
// });

// // Zod schema for IndividualCustomer (matching your Drizzle schema)
// const createIndividualCustomerSchema = z.object({
//   firstName: z.string().min(1, { message: "First Name is required" }),
//   middleName: z.string().optional(),
//   lastName: z.string().min(1, { message: "Last Name is required" }),
//   personalId: z.string().optional(),
//   country: z.string().min(1, { message: "Country is required" }),
//   addAddress: z.boolean().default(false),
//   address: addressSchema.optional(),
//   contacts: z.array(contactSchema).min(1, { message: "At least one contact is required" }),
// });

// // Zod schema for BusinessCustomer (matching your Drizzle schema)
// const createBusinessCustomerSchema = z.object({
//   businessName: z
//     .string()
//     .min(2, "Business name must be at least 2 characters"),
//   country: z.string().min(2, "Country is required"),
//   isTaxRegistered: z.boolean().default(false),
//   taxNumber: z
//     .string()
//     .nullish()
//     .refine(
//       (val) => {
//         // If isTaxRegistered is true, tax number should be a non-empty string
//         // If isTaxRegistered is false, tax number can be null/undefined/empty
//         return (
//           val === null || val === undefined || val === "" || val.length >= 2
//         );
//       },
//       { message: "Tax number must be at least 2 characters if provided" }
//     ),
//   addAddress: z.boolean().default(false),
//   address: addressSchema.optional().nullish(),
//   contacts: z.array(contactSchema).min(1, "At least one contact required"),
// }).refine(data => !data.addAddress || (data.addAddress && data.address), {
//   message: "Address is required when enabled",
//   path: ["address"],
// });

// type ContactTypeType = "email" | "mobile" | "landline" | "other";

// interface CreateCustomerModalProps {
//   open: boolean;
//   onClose: () => void;
//   onSuccess?: () => void;
//   type: "individual" | "business";
// }

// const DEFAULT_VALUES = {
//   businessName: "",
//   firstName: "",
//   middleName: "",
//   lastName: "",
//   personalId: "",
//   country: "",
//   isTaxRegistered: false,
//   taxNumber: "",
//   addAddress: false,
//   address: {
//     address1: "",
//     address2: "",
//     city: "",
//     postalCode: "",
//     country: "",
//   },
//   contacts: [
//     {
//       contact_type: "email" as ContactTypeType,
//       contact_data: "",
//       is_primary: true,
//     },
//   ],
// };

// async function logFormData(formData: FormData) {
//   const entries = Object.fromEntries(formData.entries()) as Record<string, any>;

//   // Function to transform flattened FormData to nested object
//   function transformToNested(data: Record<string, any>) {
//     const result: Record<string, any> = {};

//     for (const key in data) {
//       if (data.hasOwnProperty(key)) {
//         const value = data[key];
//         const path = key.split('.');
//         let current = result;

//         for (let i = 0; i < path.length - 1; i++) {
//           const part = path[i];
//           if (!current[part]) {
//             current[part] = {};
//           }
//           current = current[part];
//         }

//         current[path[path.length - 1]] = value;
//       }
//     }

//     return result;
//   }

//   const nestedData = transformToNested(entries);
//   console.log('nestedData Data:', JSON.stringify(nestedData));
//   const validatedData = createBusinessCustomerSchema.parse(nestedData);
//   console.log('Validated Data:', JSON.stringify(validatedData));


//   // Validate the transformed data against the schema
//   try {
//     const validatedData = createBusinessCustomerSchema.parse(nestedData);
//     console.log('Validated Data:', JSON.stringify(validatedData));

//     // Send the validated data to the server
//     const response = await fetch('/api/customers/business', {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify(validatedData),
//     });

//     if (!response.ok) {
//       toast({
//         title: "Error",
//         description: "Failed to create customer",
//         variant: "destructive",
//       });
//     } else {
//       toast({
//         title: "Success",
//         description: "Customer created successfully",
//       });
//     }
//   } catch (error: any) {
//     console.error('Validation Error:', error);
//     toast({
//       title: "Validation Error",
//       description: error.message,
//       variant: "destructive",
//     });
//   }
// }


// export function CreateCustomerModal({
//   open,
//   onClose,
//   onSuccess,
//   type,
// }: CreateCustomerModalProps) {
//   const schema = type === "business" ? createBusinessCustomerSchema : createIndividualCustomerSchema;

//   const form = useForm({
//     resolver: zodResolver(schema),
//     defaultValues: DEFAULT_VALUES,
//   });

//   const country = form.watch("country");

//   React.useEffect(() => {
//     if (country && !form.getValues("address.country")) {
//       form.setValue("address.country", country);
//     }
//   }, [country, form]);

//   React.useEffect(() => {
//     if (form.formState.errors) {
//       console.log(form.formState.errors);

//       const firstError = Object.values(form.formState.errors)[0];
//       if (firstError) {
//         toast({
//           title: "Validation Error",
//           description: firstError.message,
//           variant: "destructive",
//         });
//       }
//     }
//   }, [form.formState.errors]);

//   const addContact = () => {
//     const currentContacts = form.getValues().contacts;
//     form.setValue("contacts", [
//       ...currentContacts,
//       {
//         contact_type: "email" as ContactTypeType,
//         contact_data: "",
//         is_primary: false,
//       },
//     ]);
//   };

//   const memoizedCountries = React.useMemo(() => COUNTRIES, []);


//   return (
//     <Dialog open={open} onOpenChange={onClose}>
//       <DialogContent className="max-w-3xl h-[90vh] flex flex-col">
//         <DialogHeader>
//           <DialogTitle>Create New {type === "business" ? "Business" : "Individual"} Customer</DialogTitle>
//         </DialogHeader>

//         <Form {...form}>
//           <form
//           name="foo"
//             action={(async (form) => {
//               logFormData(form)
//                         })} // Use the server action here
//             className="flex-1 flex flex-col overflow-hidden"
//           >
//             {/* Scrollable Content */}
//             <div className="flex-1 overflow-y-auto px-6">
//               <div className="space-y-6 pb-6">
//                 {/* Basic Information */}
//                 <div className="space-y-4">
//                   {type === "business" ? (
//                     <FormInputField
//                       control={form.control}
//                       name="businessName"
//                       label="Business Name"
//                       placeholder="Company Name"
//                       required
//                     />
//                   ) : (
//                     <>
//                       <FormInputField
//                         control={form.control}
//                         name="firstName"
//                         label="First Name"
//                         placeholder="John"
//                         required
//                       />
//                       <FormInputField
//                         control={form.control}
//                         name="middleName"
//                         label="Middle Name"
//                         placeholder="Doe"
//                       />
//                       <FormInputField
//                         control={form.control}
//                         name="lastName"
//                         label="Last Name"
//                         placeholder="Smith"
//                         required
//                       />
//                       <FormInputField
//                         control={form.control}
//                         name="personalId"
//                         label="Personal ID"
//                         placeholder="1234567890"
//                       />
//                     </>
//                   )}
//                   <FormComboboxField
//                     control={form.control}
//                     name="country"
//                     label="Country"
//                     placeholder="Select a country"
//                     options={memoizedCountries}
//                     required
//                   />
//                   {type === "business" && (
//                     <>
//                       <FormSwitchField
//                         control={form.control}
//                         form={form}
//                         name="isTaxRegistered"
//                         label="Tax Registered"
//                       />
//                       {form.watch("isTaxRegistered") && (
//                         <FormInputField
//                           control={form.control}
//                           name="taxNumber"
//                           label="Tax Registration Number"
//                           placeholder="Tax ID"
//                           required
//                         />
//                       )}
//                     </>
//                   )}
//                   <FormSwitchField
//                     control={form.control}
//                     form={form}
//                     name="addAddress"
//                     label="Add Address"
//                   />
//                 </div>

//                 {/* Address Section */}
//                 {form.watch('addAddress') && (
//                   <AddressSection control={form.control} countryOptions={memoizedCountries} />
//                 )}

//                 {/* Contacts Section */}
//                 <ContactsSection
//                   control={form.control}
//                   form={form}
//                   contacts={form.watch("contacts")}
//                   onAddContact={addContact}
//                 />
//               </div>
//             </div>

//             {/* Fixed Footer */}
//             <div className="border-t p-6 mt-auto">
//               <div className="flex justify-end gap-2">
//                 <Button type="button" variant="outline" onClick={onClose}>
//                   Cancel
//                 </Button>
//                 <Button type="submit">Create {type === "business" ? "Business" : "Individual"}</Button>
//               </div>
//             </div>
//           </form>
//         </Form>
//       </DialogContent>
//     </Dialog>
//   );
// }

// function AddressSection({ control, countryOptions }: { control: any, countryOptions: typeof COUNTRIES }) {
//   const memoizedCountryOptions = React.useMemo(() => countryOptions, [countryOptions]);

//   return (
//     <div className="space-y-4 border p-4 rounded-lg">
//       <h3 className="font-medium">Address Information</h3>
//       <FormInputField
//         control={control}
//         name="address.address1"
//         label="Address 1"
//         required
//       />
//       <FormInputField
//         control={control}
//         name="address.address2"
//         label="Address 2"
//       />
//       <FormInputField
//         control={control}
//         name="address.city"
//         label="City"
//         required
//       />
//       <FormInputField
//         control={control}
//         name="address.postalCode"
//         label="Postal Code"
//         required
//       />
//       <FormComboboxField
//         control={control}
//         name="address.country"
//         label="Country"
//         options={memoizedCountryOptions}
//         required
//       />
//     </div>
//   );
// }

// function ContactsSection({
//   control,
//   form,
//   contacts,
//   onAddContact,
// }: {
//   control: any;
//   form: any;
//   contacts: any[];
//   onAddContact: () => void;
// }) {
//   return (
//     <div className="space-y-4 border p-4 rounded-lg">
//       <h3 className="font-medium">Contact Information</h3>
//       {contacts.map((_, index) => (
//         <div key={index} className="space-y-2">
//           <FormInputField
//             control={control}
//             name={`contacts.${index}.contact_data`}
//             label="Contact Data"
//             placeholder="email@example.com or +1234567890"
//             required
//           />
//           <div className="flex gap-4 items-center">
//             <FormInputField
//               control={control}
//               name={`contacts.${index}.contact_type`}
//               label="Type"
//               as="select"
//               placeholder='Email'
//               options={CONTACT_TYPE_OPTIONS}
//             />
//             <FormSwitchField
//               control={control}
//               form={form}
//               name={`contacts.${index}.is_primary`}
//               label="Primary"
//             />
//           </div>
//         </div>
//       ))}
//       <Button type="button" variant="outline" onClick={onAddContact}>
//         Add Contact
//       </Button>
//     </div>
//   );
// }

"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { FormInputField } from "@/components/form/form-input-field";
import { FormSwitchField } from "@/components/form/form-switch-field";
import { FormComboboxField } from "@/components/form/form-combobox-field";
import { toast } from "@/hooks/use-toast";
import {
  createBusinessCustomerSchema,
  createIndividualCustomerSchema,
  ContactTypeType,
} from "@/lib/validationsOLD/customer";
import { ScrollArea } from "@/components/ui/scroll-area";
import React from "react";
import { CONTACT_TYPE_OPTIONS } from "@/lib/constants/contact_details";
import { COUNTRIES } from "@/lib/constants/countries";
import { revalidatePath } from "next/cache";

interface CreateCustomerModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  type: "individual" | "business";
}

const DEFAULT_VALUES = {
  businessName: "",
  firstName: "",
  middleName: "",
  lastName: "",
  personalId: "",
  country: "",
  isTaxRegistered: false,
  taxNumber: "",
  addAddress: false,
  address: {
    address1: "",
    address2: "",
    city: "",
    postalCode: "",
    country: "",
  },
  contacts: [
    {
      contact_type: "email" as ContactTypeType,
      contact_data: "",
      is_primary: true,
    },
  ],
};

export function CreateCustomerModal({
  open,
  onClose,
  onSuccess,
  type,
}: CreateCustomerModalProps) {
  const schema = type === "business" ? createBusinessCustomerSchema : createIndividualCustomerSchema;

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: DEFAULT_VALUES,
  });

  const country = form.watch("country");

  React.useEffect(() => {
    if (country && !form.getValues("address.country")) {
      form.setValue("address.country", country);
    }
  }, [country, form]);

  React.useEffect(() => {
    if (form.formState.errors) {
      console.log(form.formState.errors);

      const firstError = Object.values(form.formState.errors)[0];
      if (firstError) {
        toast({
          title: "Validation Error",
          description: firstError.message,
          variant: "destructive",
        });
      }
    }
  }, [form.formState.errors]);

  const handleSubmit = async (data: z.infer<typeof schema>) => {
    console.log(data);
    try {
      const cleanedData = {
        ...data,
        ...(type === "individual" && {
          personalId: (data as z.infer<typeof createIndividualCustomerSchema>).personalId?.trim() === "" ? null : (data as z.infer<typeof createIndividualCustomerSchema>).personalId,
        }),
        ...(type === "business" && {
          personalId: (data as z.infer<typeof createBusinessCustomerSchema>).taxNumber?.trim() === "" ? null : (data as z.infer<typeof createBusinessCustomerSchema>).taxNumber,
        }),
        ...(type === "business" && {
            taxNumber: (data as z.infer<typeof createBusinessCustomerSchema>).isTaxRegistered 
              ? (data as z.infer<typeof createBusinessCustomerSchema>).taxNumber 
              : null,
        }),
        ...(data.addAddress ? { address: data.address } : {}),
        contacts: data.contacts.map(contact => ({
          contact_type: contact.contact_type.toLowerCase(),
          contact_data: contact.contact_data,
          is_primary: contact.is_primary,
        })),
        addAddress: undefined,
      };

      const endpoint = type === "business" ? "/api/customers/business" : "/api/customers/individual";
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cleanedData),
      });

      const result = await response.json();

      if (result.success) {
        toast({
          title: "Success",
          description: `${type === "business" ? "Business" : "Individual"} created successfully!`,
        });
        form.reset();
        onSuccess?.();
        onClose();
        // revalidatePath('/customers')
      } else {
        toast({
          title: "Error",
          description: result.error || `Failed to create ${type === "business" ? "business" : "individual"}`,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: `Failed to create ${type === "business" ? "business" : "individual"}`,
        variant: "destructive",
      });
    }
  };

  const addContact = () => {
    const currentContacts = form.getValues().contacts;
    form.setValue("contacts", [
      ...currentContacts,
      {
        contact_type: "email" as ContactTypeType,
        contact_data: "",
        is_primary: false,
      },
    ]);
  };

  const memoizedCountries = React.useMemo(() => COUNTRIES, []);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Create New {type === "business" ? "Business" : "Individual"} Customer</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form 
            onSubmit={form.handleSubmit(handleSubmit)} 
            className="flex-1 flex flex-col overflow-hidden"
          >
            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto px-6">
              <div className="space-y-6 pb-6">
                {/* Basic Information */}
                <div className="space-y-4">
                  {type === "business" ? (
                    <FormInputField
                      control={form.control}
                      name="businessName"
                      label="Business Name"
                      placeholder="Acme Corp"
                      required
                    />
                  ) : (
                    <>
                      <FormInputField
                        control={form.control}
                        name="firstName"
                        label="First Name"
                        placeholder="John"
                        required
                      />
                      <FormInputField
                        control={form.control}
                        name="middleName"
                        label="Middle Name"
                        placeholder="Doe"
                      />
                      <FormInputField
                        control={form.control}
                        name="lastName"
                        label="Last Name"
                        placeholder="Smith"
                        required
                      />
                      <FormInputField
                        control={form.control}
                        name="personalId"
                        label="Personal ID"
                        placeholder="1234567890"
                      />
                    </>
                  )}
                  <FormComboboxField
                    control={form.control}
                    name="country"
                    label="Country"
                    placeholder="Select a country"
                    options={memoizedCountries}
                    required
                  />
                  {type === "business" && (
                    <>
                      <FormSwitchField
                        control={form.control}
                        form={form}
                        name="isTaxRegistered"
                        label="Tax Registered"
                      />
                      {form.watch("isTaxRegistered") && (
                        <FormInputField
                          control={form.control}
                          name="taxNumber"
                          label="Tax Registration Number"
                          placeholder="Tax ID"
                          required
                        />
                      )}
                    </>
                  )}
                  <FormSwitchField
                    control={form.control}
                    form={form}
                    name="addAddress"
                    label="Add Address"
                  />
                </div>

                {/* Address Section */}
                {form.watch('addAddress') && (
                  <AddressSection control={form.control} countryOptions={memoizedCountries} />
                )}

                {/* Contacts Section */}
                <ContactsSection
                  control={form.control}
                  form={form}
                  contacts={form.watch("contacts")}
                  onAddContact={addContact}
                />
              </div>
            </div>

            {/* Fixed Footer */}
            <div className="border-t p-6 mt-auto">
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button type="submit">Create {type === "business" ? "Business" : "Individual"}</Button>
              </div>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

function AddressSection({ control, countryOptions }: { control: any, countryOptions: typeof COUNTRIES }) {
  const memoizedCountryOptions = React.useMemo(() => countryOptions, [countryOptions]);

  return (
    <div className="space-y-4 border p-4 rounded-lg">
      <h3 className="font-medium">Address Information</h3>
      <FormInputField
        control={control}
        name="address.address1"
        label="Address 1"
        required
      />
      <FormInputField
        control={control}
        name="address.address2"
        label="Address 2"
      />
      <FormInputField
        control={control}
        name="address.city"
        label="City"
        required
      />
      <FormInputField
        control={control}
        name="address.postalCode"
        label="Postal Code"
        required
      />
      <FormComboboxField
        control={control}
        name="address.country"
        label="Country"
        options={memoizedCountryOptions}
        required
      />
    </div>
  );
}

function ContactsSection({
  control,
  form,
  contacts,
  onAddContact,
}: {
  control: any;
  form: any;
  contacts: any[];
  onAddContact: () => void;
}) {
  return (
    <div className="space-y-4 border p-4 rounded-lg">
      <h3 className="font-medium">Contact Information</h3>
      {contacts.map((_, index) => (
        <div key={index} className="space-y-2">
          <FormInputField
            control={control}
            name={`contacts.${index}.contact_data`}
            label="Contact Data"
            placeholder="email@example.com or +1234567890"
            required
          />
          <div className="flex gap-4 items-center">
            <FormInputField
              control={control}
              name={`contacts.${index}.contact_type`}
              label="Type"
              as="select"
              placeholder='Email'
              options={CONTACT_TYPE_OPTIONS}
            />
            <FormSwitchField
              control={control}
              form={form}
              name={`contacts.${index}.is_primary`}
              label="Primary"
            />
          </div>
        </div>
      ))}
      <Button type="button" variant="outline" onClick={onAddContact}>
        Add Contact
      </Button>
    </div>
  );
}