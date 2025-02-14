import { z } from "zod";

export const createCompanySchema = z.object({
  businessName: z.string().min(1, "Business name is required"),
  isTaxRegistered: z.boolean().default(false),
  taxRegistrationNumber: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  country: z.string().min(1, "Country is required"),
  // Contact Details
  contactDetails: z.array(z.object({
    contactType: z.enum(['email', 'mobile', 'landline', 'other']),
    contactData: z.string(),
    isPrimary: z.boolean().default(false),
  })).optional(),
  // Address
  address: z.object({
    address1: z.string().optional(),
    address2: z.string().optional(),
    city: z.string(),
    country: z.string(),
    postalCode: z.string().optional(),
  }).optional(),
});

export type CreateCompanyInput = z.infer<typeof createCompanySchema>; 