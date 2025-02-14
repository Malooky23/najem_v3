// import { z } from "zod";
// import {type ContactType} from '@/server/db/schema'

// export const addressSchema = z.object({
//     address1: z.string().optional().nullish(),
//     address2: z.string().optional().nullish(),
//     city: z.string().optional().nullish(),
//     postalCode: z
//       .string()
//       .optional().nullish(),
//     country: z.string().optional().nullish(),
//   });

//   const contactSchema = z.object({
//     contact_type: ContactType,
//     contact_data: z.string().min(3, "Contact data must be at least 3 characters"),
//     is_primary: z.boolean().default(false),
//   });