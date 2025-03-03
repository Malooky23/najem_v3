import { z } from "zod";

export const CreateAddressSchema = z.object({
    address1: z.string().optional().nullish(),
    address2: z.string().optional().nullish(),
    city: z.string().optional().nullish(),
    postalCode: z.string().optional().nullish(),
    country: z.string().optional().nullish(),
})

export const CreateContactSchema = z.object({
    contact_type: z.enum(['email', 'phone']),
    contact_data: z.string().min(3, "Contact data must be at least 3 characters"),
    is_primary: z.boolean().default(false),
})

export type CreateAddress = z.infer<typeof CreateAddressSchema>
export type CreateContact = z.infer<typeof CreateContactSchema>