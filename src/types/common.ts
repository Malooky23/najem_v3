import { z } from "zod";

// Define a type for the response from API operations
export type ApiResponse<T> = {
    success: boolean;
    message?: string;
    data?: T;
  };

// Address Schemas
export const AddressDetailsSchema = z.object({
    addressId: z.string().uuid(),
    address1: z.string().nullable(),
    address2: z.string().nullable(),
    city: z.string().nullable(),
    country: z.string().nullable(),
    postalCode: z.string().nullable(),
    addressType: z.string().nullable(),
    createdAt: z.date(),
    updatedAt: z.date().nullable(),
});

export const CreateAddressSchema = z.object({
    address1: z.string().optional().nullish(),
    address2: z.string().optional().nullish(),
    city: z.string().optional().nullish(),
    country: z.string().optional().nullish(),
    postalCode: z.string().optional().nullish(),
});

export const CONTACT_TYPES = ['email', 'phone', 'mobile', 'landline', 'other'] 
// Contact Schemas
export const ContactDetailsSchema = z.object({
    contactDetailsId: z.string().uuid(),
    contactType: z.enum(['email', 'phone', 'mobile', 'landline', 'other']),
    contactData: z.string(),
    isPrimary: z.boolean(),
    createdAt: z.date(),
    updatedAt: z.date().nullable(),
});

export const CreateContactSchema = z.object({
    contact_type: z.enum(['email', 'phone', 'mobile', 'landline', 'other']),
    contact_data: z.string(),
    is_primary: z.boolean(),
})