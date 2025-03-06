import { z } from "zod";
import { AddressDetails, ContactDetails } from '@/server/db/schema'
import { max } from "drizzle-orm";
import { AddressDetailsSchema, CreateAddressSchema, CreateContactSchema } from "./common";

export const customerTypes = z.enum(["BUSINESS", "INDIVIDUAL"]);
export type CustomerTypes = z.infer<typeof customerTypes>;

export interface Business {
  businessCustomerId: string;
  businessName: string;
  isTaxRegistered: boolean;
  taxNumber: string | null;
  createdAt: Date;
  updatedAt: Date | null;
}

export interface Individual {
  individualCustomerId: string;
  firstName: string;
  middleName: string | null;
  lastName: string;
  personalID: string | null;
  createdAt: Date;
  updatedAt: Date | null;
}


// Customer data schemas for transaction-based operations
export const IndividualDataSchema = z.object({
  country: z.string().min(2, "Country is required"),
  notes: z.string().nullable().default(null),
  displayName: z.string().max(100, "Display name must be at most 100 characters"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  personalId: z.string().optional().nullish(),
  address: CreateAddressSchema.optional().nullish(),
  contacts: z.array(CreateContactSchema).min(1, "At least one contact required"),
});

export const BusinessDataSchema = z.object({
  country: z.string().min(2, "Country is required"),
  notes: z.string().nullable().default(null),
  displayName: z.string().max(100, "Display name must be at most 100 characters"),
  businessName: z.string().min(2, "Business name must be at least 2 characters"),
  isTaxRegistered: z.boolean().default(false),
  taxNumber: z.string().nullish(),
  address: CreateAddressSchema.optional().nullish(),
  contacts: z.array(CreateContactSchema).min(1, "At least one contact required"),
});

export type IndividualData = z.infer<typeof IndividualDataSchema>;
export type BusinessData = z.infer<typeof BusinessDataSchema>;

// Response types
export type CreateCustomerResponse = {
  success: boolean;
  data?: any;
  error?: string;
};

// Enriched customer type
export const customerSchema = z.object({
  customerId: z.string(),
  customerNumber: z.number(),
  customerType: customerTypes,
  notes: z.string().nullable().optional(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date().nullable(),
  country: z.string(),
  displayName: z.string().max(100),
  individual: z.object({
    firstName: z.string(),
    middleName: z.string().nullable(),
    lastName: z.string(),
    personalID: z.string().nullable()
  }).nullable(),
  business: z.object({
    businessName: z.string(),
    isTaxRegistered: z.boolean(),
    taxNumber: z.string().nullable()
  }).nullable(),
  contacts: z.array(z.object({
    contactDetail: z.any()
  })).nullable(),
  addresses:  z.array(z.object({
    address: AddressDetailsSchema})).nullable(),
}).transform((customer) => ({
  ...customer,
}));

export const customerList = z.object({
  customerId: z.string(),
  customerNumber: z.number(),
  displayName: z.string().max(100),
});

export type EnrichedCustomer = z.infer<typeof customerSchema>;
export type CustomerList = z.infer<typeof customerList>;
