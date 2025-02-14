import { z } from "zod";
import { AddressDetails, ContactDetails } from '@/server/db/schema'

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

// Base Zod schemas that will generate our types
export const customerSchema = z.object({
  customerId: z.string(),
  customerNumber: z.number(),
  customerType: customerTypes,
  notes: z.string().nullable().optional(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date().nullable(),
  country: z.string(),
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
    contactDetail: z.any() // Type this properly based on your ContactDetails
  })).nullable(),
  addresses: z.array(z.object({
    address: z.any() // Type this properly based on your AddressDetails
  })).nullable(),
}).transform((customer) => ({
  ...customer,
  displayName: customer.customerType === 'BUSINESS' 
    ? customer.business?.businessName 
    : customer.individual 
      ? `${customer.individual.firstName}${customer.individual.middleName ? ' ' + customer.individual.middleName : ''} ${customer.individual.lastName}`
      : 'Unknown'
}));

// Derive types from the schema
export type EnrichedCustomer = z.infer<typeof customerSchema>;

