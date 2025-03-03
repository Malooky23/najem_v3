"use server"

import { sql } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import { z } from 'zod'
import { db } from "@/server/db"

const ContactTypeEnum = z.enum(['email', 'phone']);
const contactSchema = z.object({
  contact_type: ContactTypeEnum,
  contact_data: z.string().min(3, "Contact data must be at least 3 characters"),
  is_primary: z.boolean().default(false),
});
const createIndividualCustomerSchema = z.object({
  firstName: z.string().min(1, "First name must be at least 1 characters"),
  middleName: z.string().optional(),
  lastName: z.string().min(1, "Last name must be at least 1 characters"),
  displayName: z.string().max(100, "Display name must be at most 100 characters"),
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
  notes: z.string().nullable().default(null)
}).refine(data => !data.addAddress || (data.addAddress && data.address), {
  message: "Address is required when enabled",
  path: ["address"],
});


const createBusinessCustomerSchema = z.object({
  businessName: z
    .string()
    .min(2, "Business name must be at least 2 characters"),
  displayName: z.string().max(100, "Display name must be at most 100 characters"),
  country: z.string().min(2, "Country is required"),
  isTaxRegistered: z.boolean().default(false),
  taxNumber: z
    .string()
    .nullish()
    .refine(
      (val) => {
        return (
          val === null || val === undefined || val === "" || val.length >= 2
        );
      },
      { message: "Tax number must be at least 2 characters if provided" }
    ),
  addAddress: z.boolean().default(false),
  address: z.object({
    address1: z.string().optional().nullish(),
    address2: z.string().optional().nullish(),
    city: z.string().optional().nullish(),
    postalCode: z.string().optional().nullish(),
    country: z.string().optional().nullish(),
  }).optional().nullish(),
  contacts: z.array(contactSchema).min(1, "At least one contact required"),
  notes: z.string().nullable().default(null)
}).refine(data => !data.addAddress || (data.addAddress && data.address), {
  message: "Address is required when enabled",
  path: ["address"],
});

export async function createBusinessCustomer(data: Record<string, any>) {
  try {
    const validatedData = createBusinessCustomerSchema.parse(data);
    // console.log(`      
    //   SELECT new_business_customer(
    //         ${validatedData.country}::TEXT,
    //         ${validatedData.businessName}::TEXT,
    //         ${validatedData.isTaxRegistered}::BOOLEAN,
    //         ${validatedData.taxNumber}::TEXT,
    //         ${JSON.stringify(validatedData.address)}::JSONB,
    //         ${JSON.stringify(validatedData.contacts)}::JSONB,
    //         ${validatedData.notes}::TEXT
    //       ) as result`
    // );

    // await new Promise((resolve) => setTimeout(resolve, 3000));
    const result = await db.execute<{ result: any }>(sql`
          SELECT new_business_customer(
            ${validatedData.country}::TEXT,
            ${validatedData.businessName}::TEXT,
            ${validatedData.isTaxRegistered}::BOOLEAN,
            ${validatedData.taxNumber}::TEXT,
            ${JSON.stringify(validatedData.address)}::JSONB,
            ${JSON.stringify(validatedData.contacts)}::JSONB,
            ${validatedData.notes}::TEXT
          ) as result
        `);
    const dbResult = result.rows[0].result;
    console.log(dbResult);



    // Add revalidation here after successful DB operation
    revalidatePath('/customers');

    return dbResult

  } catch (error) {
    console.error('Validation error:', error);
    console.error('Submitted Data:', data);
    return { success: false, error };
  }
}

export type CreateIndivualResponse = {
  success: boolean;
  data?: any;
  error?: string;
};


import { addressDetails, contactDetails, customers, customerType, entityAddresses, entityContactDetails, individualCustomers } from "@/server/db/schema";
import { CreateAddress, CreateAddressSchema, CreateContact, CreateContactSchema } from "@/types/common"

// export async function createIndividualCustomer(data: Record<string, any>): Promise<CreateIndivualResponse> {
//   let response: CreateIndivualResponse = { success: false };
//   try {
//     const customerData = createIndividualCustomerSchema.parse(data);

//     const tx = await db.transaction(async (tx) => {
//       try {
//         const init = await tx.insert(customers).values(
//           {
//             customerType: 'INDIVIDUAL',
//             country: customerData.country,
//             notes: customerData.notes,
//             displayName: customerData.displayName,
//           }).returning({ customerId: customers.customerId })

//         const customerId = init[0].customerId
//         if (!customerId) {
//           tx.rollback()
//         }

//         tx.insert(individualCustomers).values(
//           {
//             individualCustomerId: customerId,
//             firstName: customerData.firstName,
//             lastName: customerData.lastName,
//             personalID: customerData.personalId,
//           }).returning({ individualCustomerId: individualCustomers.individualCustomerId })

//         if (customerData.address) {
//           const [insertAddress] = await tx.insert(addressDetails).values({
//             address1: customerData.address.address1,
//             address2: customerData.address.address2,
//             city: customerData.address.city,
//             country: customerData.address.country,
//             postalCode: customerData.address.postalCode,
//             addressType: "Customer Address",
//           }).returning({ addressId: addressDetails.addressId })

//           if (insertAddress.addressId) {
//             tx.insert(entityAddresses).values({
//               entityId: customerId,
//               addressId: insertAddress.addressId,
//               entityType: "CUSTOMER",
//             })
//           }
//         }

//         if (customerData.contacts) {
//           customerData.contacts.map(async (contact, index) => {
//             const [insertContact] = await tx.insert(contactDetails).values({
//               contactType: contact.contact_type,
//               contactData: contact.contact_data,
//               isPrimary: contact.is_primary,
//             }).returning({ contactId: contactDetails.contactDetailsId })
//             console.log("Inserted contact:", insertContact.contactId)
//             if (insertContact.contactId) {
//               console.log("Inserted contact:", index, "--", contact)
//               await tx.insert(entityContactDetails).values({
//                 entityId: customerId,
//                 contactDetailsId: insertContact.contactId,
//                 entityType: "CUSTOMER",
//                 contactType: contact.contact_type,
//               })
//             }
//           })
//         }

//         response = ({ success: true })
//       } catch (e) {
//         tx.rollback()
//         return { success: false, error: e }
//       }
//     })
//     return response
//   }
//   catch (error: any) {
//     console.error('Validation error:', error);
//     console.error('Submitted Data:', data);
//     response = { success: false, error: error };
//     return response
//   }

// }

// interface CustomerAddress {
//   address1: string;
//   address2?: string;
//   city: string;
//   country: string;
//   postalCode: string;
// }

// interface CustomerContact {
//   contact_type: string;
//   contact_data: string;
//   is_primary: boolean;
// }

// interface CustomerData {
//   country: string;
//   notes?: string | undefined;
//   displayName: string;
//   firstName: string;
//   lastName: string;
//   personalId: string;
//   address?: CustomerAddress;
//   contacts?: CustomerContact[];
// }

const CustomerDataSchema = z.object({
  // customerType: z.enum(['INDIVIDUAL', 'BUSINESS']),
  country: z.string().min(2, "Country is required"),
  notes: z.string().nullable().default(null),
  displayName: z.string().max(100, "Display name must be at most 100 characters"),

  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  personalId: z.string().optional().nullish(),

  address: CreateAddressSchema.optional().nullish(),
  contacts: z.array(CreateContactSchema).min(1, "At least one contact required"),
})
type CustomerData = z.infer<typeof CustomerDataSchema>


class CustomerCreationError extends Error {
  constructor(message: string, public readonly cause?: unknown) {
    super(message);
    this.name = 'CustomerCreationError';
  }
}
type DatabaseTransaction = any
// type DatabaseTransaction = typeof db;


export async function createIndividualCustomer(
  data: Record<string, any>
): Promise<CreateIndivualResponse> {
  try {
    const customerData = createIndividualCustomerSchema.parse(data);
    return await executeCustomerCreation(customerData);
  } catch (error) {
    // logger.error('Customer creation failed', { error, data });
    if (error instanceof z.ZodError) {
      return { success: false, error: 'Invalid customer data' };
    }
    return { 
      success: false, 
      error: error instanceof CustomerCreationError ? error.message : 'Internal server error' 
    };
  }
}


async function executeCustomerCreation(
  customerData: CustomerData
): Promise<CreateIndivualResponse> {
  return await db.transaction(async (tx) => {
    try {
      const customerId = await createBaseCustomer(tx, customerData);
      await createIndividualDetails(tx, customerId, customerData);
      
      if (customerData.address) {
        await createCustomerAddress(tx, customerId, customerData.address);
      }
      
      if (customerData.contacts?.length) {
        await createCustomerContacts(tx, customerId, customerData.contacts);
      }

      return { success: true };
    } catch (error) {
      throw new CustomerCreationError(
        'Failed to create customer record',
        error
      );
    }
  });
}

async function createBaseCustomer(
  tx: DatabaseTransaction,
  data: CustomerData
): Promise<string> {
  const [result] = await tx
    .insert(customers)
    .values({
      customerType: 'INDIVIDUAL',
      country: data.country,
      notes: data.notes,
      displayName: data.displayName,
    })
    .returning({ customerId: customers.customerId });

  if (!result?.customerId) {
    throw new CustomerCreationError('Failed to create base customer record');
  }

  return result.customerId;
}

async function createIndividualDetails(
  tx: DatabaseTransaction,
  customerId: string,
  data: CustomerData
): Promise<void> {
  await tx.insert(individualCustomers).values({
    individualCustomerId: customerId,
    firstName: data.firstName,
    lastName: data.lastName,
    personalID: data.personalId,
  });
}

async function createCustomerAddress(
  tx: DatabaseTransaction,
  customerId: string,
  address: CreateAddress
): Promise<void> {
  const [insertedAddress] = await tx
    .insert(addressDetails)
    .values({
      ...address,
      addressType: "Customer Address",
    })
    .returning({ addressId: addressDetails.addressId });

  if (insertedAddress?.addressId) {
    await tx.insert(entityAddresses).values({
      entityId: customerId,
      addressId: insertedAddress.addressId,
      entityType: "CUSTOMER",
    });
  }
}

async function createCustomerContacts(
  tx: DatabaseTransaction,
  customerId: string,
  contacts: CreateContact[]
): Promise<void> {
  await Promise.all(
    contacts.map(async (contact) => {
      const [insertedContact] = await tx
        .insert(contactDetails)
        .values({
          contactType: contact.contact_type,
          contactData: contact.contact_data,
          isPrimary: contact.is_primary,
        })
        .returning({ contactId: contactDetails.contactDetailsId });

      if (insertedContact?.contactId) {
        await tx.insert(entityContactDetails).values({
          entityId: customerId,
          contactDetailsId: insertedContact.contactId,
          entityType: "CUSTOMER",
          contactType: contact.contact_type,
        });
      }
    })
  );
}
