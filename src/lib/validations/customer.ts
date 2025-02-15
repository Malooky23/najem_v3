// import { z } from "zod";

// const individualSchema = z.object({
//   firstName: z.string(),
//   middleName: z.string().nullable(),
//   lastName: z.string(),
//   personalID: z.string().nullable(),
// });

// const businessSchema = z.object({
//   businessName: z.string(),
//   isTaxRegistered: z.boolean(),
//   taxNumber: z.string().nullable(),
// });

// export const enrichedCustomerSchema = z.object({
//   customerId: z.string(),
//   customerNumber: z.number(),
//   customerType: z.enum(["BUSINESS", "INDIVIDUAL"]),
//   notes: z.string().nullable().optional(),
//   createdAt: z.coerce.date(),
//   updatedAt: z.coerce.date().nullable().optional(),
//   country: z.string(),
//   individual: individualSchema.nullable().optional(),
//   business: businessSchema.nullable().optional(),
//   contacts: z.array(z.object({
//     contactDetail: z.any() // Define proper schema based on ContactDetails
//   })).nullable().optional(),
//   addresses: z.array(z.object({
//     address: z.any() // Define proper schema based on AddressDetails
//   })).nullable().optional(),
// });

// export type ValidatedCustomer = z.infer<typeof enrichedCustomerSchema>;
