"use server"

import { sql } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import { z } from 'zod'
import { db } from "@/server/db"
import { addressDetails, contactDetails, customers, businessCustomers, individualCustomers, entityAddresses, entityContactDetails } from "@/server/db/schema"
import { CreateAddressSchema, CreateContactSchema } from "@/types/common"
import { BusinessData, BusinessDataSchema, CreateCustomerResponse, IndividualData, IndividualDataSchema } from "@/types/customer"
import { sendEmail, emailTemplates } from "@/server/services/email-service"

class CustomerCreationError extends Error {
  constructor(message: string, public readonly cause?: unknown) {
    super(message);
    this.name = 'CustomerCreationError';
  }
}

type DatabaseTransaction = any

// Helper to find primary email from contacts
function getPrimaryEmail(contacts: z.infer<typeof CreateContactSchema>[]): string | undefined {
  const primaryEmail = contacts.find(
    contact => contact.contact_type === 'email' && contact.is_primary
  )?.contact_data;
  console.log('Primary email:', primaryEmail);
  return primaryEmail;
}

export async function createIndividualCustomer(
  data: Record<string, any>
): Promise<CreateCustomerResponse> {
  try {
    const customerData = IndividualDataSchema.parse(data);
    console.log('Customer Data:', customerData);
    return await executeIndividualCustomerCreation(customerData);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: 'Invalid customer data' };
    }
    return {
      success: false,
      error: error instanceof CustomerCreationError ? error.message : 'Internal server error'
    };
  }
}

export async function createBusinessCustomer(
  data: Record<string, any>
): Promise<CreateCustomerResponse> {
  try {
    const customerData = BusinessDataSchema.parse(data);
    return await executeBusinessCustomerCreation(customerData);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: 'Invalid customer data' };
    }
    return {
      success: false,
      error: error instanceof CustomerCreationError ? error.message : 'Internal server error'
    };
  }
}

async function executeIndividualCustomerCreation(
  customerData: IndividualData
): Promise<CreateCustomerResponse> {
  return await db.transaction(async (tx) => {
    try {
      const customerId = await createBaseCustomer(tx, 'INDIVIDUAL', customerData);
      await createIndividualDetails(tx, customerId, customerData);
      
      if (customerData.address) {
        await createCustomerAddress(tx, customerId, customerData.address);
      }
      
      if (customerData.contacts?.length) {
        await createCustomerContacts(tx, customerId, customerData.contacts);
        
        // Send welcome email if primary email exists
        const primaryEmail = getPrimaryEmail(customerData.contacts);
        if (primaryEmail) {
          const { subject, html } = emailTemplates.newCustomer(
            `${customerData.firstName} ${customerData.lastName}`
          );
          await sendEmail({
            to: primaryEmail,
            subject,
            html
          });
        }
      }

      revalidatePath('/customers');
      return { success: true };
    } catch (error) {
      throw new CustomerCreationError(
        'Failed to create individual customer record',
        error
      );
    }
  });
}

async function executeBusinessCustomerCreation(
  customerData: BusinessData
): Promise<CreateCustomerResponse> {
  return await db.transaction(async (tx) => {
    try {
      const customerId = await createBaseCustomer(tx, 'BUSINESS', customerData);
      await createBusinessDetails(tx, customerId, customerData);
      
      if (customerData.address) {
        await createCustomerAddress(tx, customerId, customerData.address);
      }
      
      if (customerData.contacts?.length) {
        await createCustomerContacts(tx, customerId, customerData.contacts);
        
        // Send welcome email if primary email exists
        // const primaryEmail = getPrimaryEmail(customerData.contacts);
        // if (primaryEmail) {
        //   const { subject, html } = emailTemplates.newCustomer(
        //     customerData.businessName
        //   );
        //   await sendEmail({
        //     to: primaryEmail,
        //     subject,
        //     html
        //   });
        // }
      }

      revalidatePath('/customers');
      return { success: true };
    } catch (error) {
      throw new CustomerCreationError(
        'Failed to create business customer record',
        error
      );
    }
  });
}

async function createBaseCustomer(
  tx: DatabaseTransaction,
  type: 'INDIVIDUAL' | 'BUSINESS',
  data: IndividualData | BusinessData
): Promise<string> {
  const [result] = await tx
    .insert(customers)
    .values({
      customerType: type,
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
  data: IndividualData
): Promise<void> {
  await tx.insert(individualCustomers).values({
    individualCustomerId: customerId,
    firstName: data.firstName,
    lastName: data.lastName,
    personalID: data.personalId,
  });
}

async function createBusinessDetails(
  tx: DatabaseTransaction,
  customerId: string,
  data: BusinessData
): Promise<void> {
  await tx.insert(businessCustomers).values({
    businessCustomerId: customerId,
    businessName: data.businessName,
    isTaxRegistered: data.isTaxRegistered,
    taxNumber: data.taxNumber,
  });
}

async function createCustomerAddress(
  tx: DatabaseTransaction,
  customerId: string,
  address: z.infer<typeof CreateAddressSchema>
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
  contacts: z.infer<typeof CreateContactSchema>[]
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
