import { z } from "zod";

export const createUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  firstName: z.string().min(2).max(50),
  lastName: z.string().min(2).max(50),
  userType: z.enum(['EMPLOYEE', 'CUSTOMER', 'DEMO']),
  customerId: z.string().uuid().optional(),
  isActive: z.boolean().default(true),
  isAdmin: z.boolean().default(false),
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

export const updateUserSchema = createUserSchema.partial();
