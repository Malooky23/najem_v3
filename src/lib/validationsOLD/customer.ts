// import { z } from "zod";
// import { contactType } from "@/server/db/schema";

// const addressSchema = z.object({
//   address1: z.string().optional(),
//   address2: z.string().optional(),
//   city: z.string(),
//   country: z.string(),
//   postalCode: z.string().optional(),
// });

// const contactDetailsSchema = z.object({
//   contactType: z.enum(["email", "mobile", "landline", "other"]),
//   contactData: z.string(),
//   isPrimary: z.boolean().default(false),
// });

// export const createIndividualCustomerSchema = z.object({
//   firstName: z.string().min(1, "First name is required"),
//   middleName: z.string().optional(),
//   lastName: z.string().min(1, "Last name is required"),
//   personalId: z.string().optional(),
//   notes: z.string().optional(),
//   country: z.string().min(1, "Country is required"),
//   address: addressSchema.optional(),
//   contactDetails: z.array(contactDetailsSchema).optional(),
// });

// // export const createBusinessCustomerSchema = z.object({
// //   businessName: z.string().min(1, "Business name is required"),
// //   isTaxRegistered: z.boolean().default(false),
// //   taxRegistrationNumber: z.string().optional(),
// //   notes: z.string().optional(),
// //   country: z.string().min(1, "Country is required"),
// //   address: z.array(addressSchema).optional(),
// //   contactDetails: z.array(contactDetailsSchema).optional(),
// // });

// import { contactType as drizzleContactType } from "@/server/db/schema";

// const ContactType = z.enum(['email', 'mobile', 'landline', 'other']);

// export const createBusinessCustomerSchema = z.object({
//   businessName: z
//     .string()
//     .min(2, "Business name must be at least 2 characters"),
//   country: z.string().min(2, "Country is required"),
//   isTaxRegistered: z.boolean().default(false),
//   taxNumber: z.string().optional(),
//   address: z.object({
//     address1: z.string().min(2),
//     address2: z.string().min(2),
//     city: z.string().min(2),
//     postalCode: z.string().min(2),
//     country: z.string().min(2),
//   }),
//   contacts: z
//     .array(
//       z.object({
//         contact_type: ContactType,
//         contact_data: z.string().min(3),
//         is_primary: z.boolean().default(false),
//       })
//     )
//     .min(1, "At least one contact required"),
// });

// export type CreateIndividualCustomerInput = z.infer<
//   typeof createIndividualCustomerSchema
// >;
// export type CreateBusinessCustomerInput = z.infer<
//   typeof createBusinessCustomerSchema
// >;

import { z } from "zod";
import { contactType } from "@/server/db/schema";

// Base schemas for reuse
const ContactType = z.enum(contactType.enumValues);
// const ContactType = z.enum(['email', 'mobile', 'landline', 'other']);

const addressSchema = z.object({
  address1: z.string().optional().nullish(),
  address2: z.string().optional().nullish(),
  city: z.string().optional().nullish(),
  postalCode: z
    .string()
    .optional().nullish(),
  country: z.string().optional().nullish(),
});
// const addressSchema = z.object({
//   address1: z.string().min(2, "Address must be at least 2 characters"),
//   address2: z.string().optional(),
//   city: z.string().min(2, "City must be at least 2 characters"),
//   postalCode: z
//     .string()
//     .min(2, "Postal code must be at least 2 characters")
//     .optional(),
//   country: z.string().min(2, "Country must be at least 2 characters"),
// });

const contactSchema = z.object({
  contact_type: ContactType,
  contact_data: z.string().min(3, "Contact data must be at least 3 characters"),
  is_primary: z.boolean().default(false),
});

// Main business customer schema
export const createBusinessCustomerSchema = z.object({
  businessName: z
    .string()
    .min(2, "Business name must be at least 2 characters"),
  country: z.string().min(2, "Country is required"),
  isTaxRegistered: z.boolean().default(false),
  taxNumber: z
    .string()
    .nullish()
    .refine(
      (val) => {
        // If isTaxRegistered is true, tax number should be a non-empty string
        // If isTaxRegistered is false, tax number can be null/undefined/empty
        return (
          val === null || val === undefined || val === "" || val.length >= 2
        );
      },
      { message: "Tax number must be at least 2 characters if provided" }
    ),
  addAddress: z.boolean().default(false),
  address: addressSchema.optional().nullish(),
  contacts: z.array(contactSchema).min(1, "At least one contact required"),
}).refine(data => !data.addAddress || (data.addAddress && data.address), {
  message: "Address is required when enabled",
  path: ["address"],
});

export const createIndividualCustomerSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  middleName: z.string().optional(),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  personalId: z.string().optional().nullish(),
  country: z.string().min(2, "Country is required"),
  addAddress: z.boolean().default(false),
  address: z.object({
    address1: z.string().optional().nullish(),
    address2: z.string().optional().nullish(),
    city: z.string().optional().nullish(),
    postalCode: z.string().optional().nullish(),
    country: z.string().optional().nullish(),
  }).optional().nullish(),
  contacts: z.array(contactSchema).min(1, "At least one contact required"),
}).refine(data => !data.addAddress || (data.addAddress && data.address), {
  message: "Address is required when enabled",
  path: ["address"],
});

// Types
export type ContactTypeType = z.infer<typeof ContactType>;
export type AddressType = z.infer<typeof addressSchema>;
export type ContactType = z.infer<typeof contactSchema>;
export type CreateBusinessCustomerInput = z.infer<
  typeof createBusinessCustomerSchema
>;
