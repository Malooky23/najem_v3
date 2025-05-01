"use server"

import { sql, eq, and, ne } from "drizzle-orm" // Add eq, and, ne
import { revalidatePath } from "next/cache"
import { z } from 'zod'
import { db } from "@/server/db"
import {
  addressDetails,
  contactDetails,
  customers,
  businessCustomers,
  individualCustomers,
  entityAddresses,
  entityContactDetails
} from "@/server/db/schema"
import { CreateAddressSchema, CreateContactSchema } from "@/types/common"
import {
  BusinessData,
  BusinessDataSchema,
  CreateCustomerResponse,
  IndividualData,
  IndividualDataSchema
} from "@/types/customer"
import { sendEmail, emailTemplates } from "@/server/services/email-service"

// --- Error Class ---
class CustomerUpdateError extends Error {
  constructor(message: string, public readonly cause?: unknown) {
    super(message);
    this.name = 'CustomerUpdateError';
  }
}

type DatabaseTransaction = typeof db.transaction extends (arg: (tx: infer TX) => any) => any ? TX : never; // Infer transaction type

// --- Schemas for Update ---
const UpdateIndividualDataSchema = IndividualDataSchema.extend({
  customerId: z.string().uuid("Invalid Customer ID"),
}).partial(); // Make all fields optional for update

const UpdateBusinessDataSchema = BusinessDataSchema.extend({
  customerId: z.string().uuid("Invalid Customer ID"),
}).partial(); // Make all fields optional for update

type UpdateIndividualData = z.infer<typeof UpdateIndividualDataSchema>;
type UpdateBusinessData = z.infer<typeof UpdateBusinessDataSchema>;

// --- Main Update Functions ---

export async function updateIndividualCustomer(
  data: Record<string, any>
): Promise<CreateCustomerResponse> { // Reusing response type for simplicity
  try {
    const customerData = UpdateIndividualDataSchema.parse(data);
    if (!customerData.customerId) {
      return { success: false, error: 'Customer ID is required for update.' };
    }
    console.log('Updating Individual Customer Data:', customerData);
    return await executeIndividualCustomerUpdate(customerData.customerId, customerData);
  } catch (error) {
    console.error("Update Individual Error:", error);
    if (error instanceof z.ZodError) {
      return { success: false, error: 'Invalid customer data for update', data: error.issues };
    }
    return {
      success: false,
      error: error instanceof CustomerUpdateError ? error.message : 'Internal server error during update'
    };
  }
}

export async function updateBusinessCustomer(
  data: Record<string, any>
): Promise<CreateCustomerResponse> {
  try {
    const customerData = UpdateBusinessDataSchema.parse(data);
    if (!customerData.customerId) {
      return { success: false, error: 'Customer ID is required for update.' };
    }
    console.log('Updating Business Customer Data:', customerData);
    return await executeBusinessCustomerUpdate(customerData.customerId, customerData);
  } catch (error) {
    console.error("Update Business Error:", error);
    if (error instanceof z.ZodError) {
      return { success: false, error: 'Invalid customer data for update', data: error.issues };
    }
    return {
      success: false,
      error: error instanceof CustomerUpdateError ? error.message : 'Internal server error during update'
    };
  }
}

export async function deleteCustomer(customerId: string) {
  if (!customerId || customerId === ''
  ) return { success: false, error: 'Customer ID is required for update.' };
  try {

    await db.update(customers)
      .set({ isDeleted: true })
      .where(eq(customers.customerId, customerId));

    return { success: true };
  }catch{
    return { success: false, error: 'Failed to delete customer.' };  }

}
// --- Update Execution Logic ---

async function executeIndividualCustomerUpdate(
  customerId: string,
  updateData: UpdateIndividualData
): Promise<CreateCustomerResponse> {
  return await db.transaction(async (tx) => {
    try {
      // 1. Update Base Customer Info (if changed)
      const customerUpdatePayload: Partial<typeof customers.$inferInsert> = {};
      if (updateData.displayName) customerUpdatePayload.displayName = updateData.displayName;
      if (updateData.country) customerUpdatePayload.country = updateData.country;
      if (updateData.notes !== undefined) customerUpdatePayload.notes = updateData.notes; // Allow setting notes to null

      if (Object.keys(customerUpdatePayload).length > 0) {
        customerUpdatePayload.updatedAt = new Date();
        await tx.update(customers)
          .set(customerUpdatePayload)
          .where(eq(customers.customerId, customerId));
      }

      // 2. Update Individual Details (if changed)
      const individualUpdatePayload: Partial<typeof individualCustomers.$inferInsert> = {};
      if (updateData.firstName) individualUpdatePayload.firstName = updateData.firstName;
      if (updateData.lastName) individualUpdatePayload.lastName = updateData.lastName;
      if (updateData.middleName !== undefined) individualUpdatePayload.middleName = updateData.middleName;
      if (updateData.personalId !== undefined) individualUpdatePayload.personalID = updateData.personalId;

      if (Object.keys(individualUpdatePayload).length > 0) {
        individualUpdatePayload.updatedAt = new Date();
        const update = await tx.update(individualCustomers)
          .set(individualUpdatePayload)
          .where(eq(individualCustomers.individualCustomerId, customerId)).returning()
        console.log("update:", JSON.stringify(update, null, 2))
      }

      // 3. Handle Address (Update/Create/Delete)
      await handleAddressUpdate(tx, customerId, updateData.address);

      // 4. Handle Contacts (Replace existing)
      if (updateData.contacts) { // Only update contacts if provided
        await replaceCustomerContacts(tx, customerId, updateData.contacts);
      }

      return { success: true };
    } catch (error) {
      console.error('Error during individual customer update transaction:', error);
      throw new CustomerUpdateError(
        'Failed to update individual customer record',
        error
      );
    }
  });
}

async function executeBusinessCustomerUpdate(
  customerId: string,
  updateData: UpdateBusinessData
): Promise<CreateCustomerResponse> {
  return await db.transaction(async (tx) => {
    try {
      // 1. Update Base Customer Info (if changed)
      const customerUpdatePayload: Partial<typeof customers.$inferInsert> = {};
      if (updateData.displayName) customerUpdatePayload.displayName = updateData.displayName;
      if (updateData.country) customerUpdatePayload.country = updateData.country;
      if (updateData.notes !== undefined) customerUpdatePayload.notes = updateData.notes;
      if (Object.keys(customerUpdatePayload).length > 0) {
        customerUpdatePayload.updatedAt = new Date();
        await tx.update(customers)
          .set(customerUpdatePayload)
          .where(eq(customers.customerId, customerId));
      }

      // 2. Update Business Details (if changed)
      const businessUpdatePayload: Partial<typeof businessCustomers.$inferInsert> = {};
      if (updateData.businessName) businessUpdatePayload.businessName = updateData.businessName;
      if (updateData.isTaxRegistered !== undefined) businessUpdatePayload.isTaxRegistered = updateData.isTaxRegistered;
      // Handle taxNumber carefully: update if provided, set to null if isTaxRegistered is false
      if (updateData.isTaxRegistered === false) {
        businessUpdatePayload.taxNumber = null;
      } else if (updateData.taxNumber !== undefined) {
        businessUpdatePayload.taxNumber = updateData.taxNumber;
      }


      if (Object.keys(businessUpdatePayload).length > 0) {
        businessUpdatePayload.updatedAt = new Date();
        await tx.update(businessCustomers)
          .set(businessUpdatePayload)
          .where(eq(businessCustomers.businessCustomerId, customerId));
      }

      // 3. Handle Address (Update/Create/Delete)
      await handleAddressUpdate(tx, customerId, updateData.address);

      // 4. Handle Contacts (Replace existing)
      if (updateData.contacts) { // Only update contacts if provided
        await replaceCustomerContacts(tx, customerId, updateData.contacts);
      }

      revalidatePath('/customers');
      revalidatePath(`/customers/${customerId}`);
      return { success: true };
    } catch (error) {
      console.error('Error during business customer update transaction:', error);
      throw new CustomerUpdateError(
        'Failed to update business customer record',
        error
      );
    }
  });
}


// --- Helper Functions ---

async function handleAddressUpdate(
  tx: DatabaseTransaction,
  customerId: string,
  newAddressData: z.infer<typeof CreateAddressSchema> | null | undefined
): Promise<void> {
  // Find existing linked address ID
  const existingLink = await tx.query.entityAddresses.findFirst({
    where: and(
      eq(entityAddresses.entityId, customerId),
      eq(entityAddresses.entityType, "CUSTOMER")
    ),
    columns: { addressId: true }
  });
  const existingAddressId = existingLink?.addressId;

  const hasNewAddressData = newAddressData && Object.values(newAddressData).some(v => v !== null && v !== '');

  if (hasNewAddressData) {
    const addressPayload = { ...newAddressData, updatedAt: new Date() };
    if (existingAddressId) {
      // Update existing address
      await tx.update(addressDetails)
        .set(addressPayload)
        .where(eq(addressDetails.addressId, existingAddressId));
    } else {
      // Create new address and link it
      addressPayload.addressType = "Customer Address"; // Set type for new address
      const [ insertedAddress ] = await tx.insert(addressDetails)
        .values(addressPayload)
        .returning({ addressId: addressDetails.addressId });

      if (insertedAddress?.addressId) {
        await tx.insert(entityAddresses).values({
          entityId: customerId,
          addressId: insertedAddress.addressId,
          entityType: "CUSTOMER",
        });
      } else {
        throw new CustomerUpdateError('Failed to create new address during update');
      }
    }
  } else if (existingAddressId) {
    // No new address data provided, but an address exists - unlink and delete
    await tx.delete(entityAddresses)
      .where(and(
        eq(entityAddresses.entityId, customerId),
        eq(entityAddresses.entityType, "CUSTOMER"),
        eq(entityAddresses.addressId, existingAddressId)
      ));

    // Optional: Delete the address if it's not linked to any other entity
    // This requires checking entityAddresses for other links to existingAddressId
    // For simplicity, we'll leave the address record for now.
    // await tx.delete(addressDetails).where(eq(addressDetails.addressId, existingAddressId));
  }
  // If no new data and no existing address, do nothing.
}

async function replaceCustomerContacts(
  tx: DatabaseTransaction,
  customerId: string,
  newContacts: z.infer<typeof CreateContactSchema>[]
): Promise<void> {
  // 1. Get IDs of existing contacts linked to the customer
  const existingContactLinks = await tx.query.entityContactDetails.findMany({
    where: and(
      eq(entityContactDetails.entityId, customerId),
      eq(entityContactDetails.entityType, "CUSTOMER")
    ),
    columns: { contactDetailsId: true }
  });
  const existingContactIds = existingContactLinks.map(link => link.contactDetailsId);

  // 2. Delete the links in entityContactDetails
  if (existingContactIds.length > 0) {
    await tx.delete(entityContactDetails)
      .where(and(
        eq(entityContactDetails.entityId, customerId),
        eq(entityContactDetails.entityType, "CUSTOMER")
      ));

    // 3. Delete the actual contacts from contactDetails
    // Optional: Add check if contacts are shared before deleting
    await tx.delete(contactDetails)
      .where(sql`${contactDetails.contactDetailsId} IN ${existingContactIds}`);
  }

  // 4. Insert the new contacts
  if (newContacts && newContacts.length > 0) {
    await createCustomerContacts(tx, customerId, newContacts); // Reuse existing creation helper
  }
}


// --- Existing Creation Functions (Keep as they are) ---

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
    console.log('Creating Individual Customer Data:', customerData); // Log creation
    return await executeIndividualCustomerCreation(customerData);
  } catch (error) {
    console.error("Create Individual Error:", error); // Log creation error
    if (error instanceof z.ZodError) {
      return { success: false, error: 'Invalid customer data', data: error.issues };
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
    console.log('Creating Business Customer Data:', customerData); // Log creation
    return await executeBusinessCustomerCreation(customerData);
  } catch (error) {
    console.error("Create Business Error:", error); // Log creation error
    if (error instanceof z.ZodError) {
      return { success: false, error: 'Invalid customer data', data: error.issues };
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
      }

      revalidatePath('/customers');
      return { success: true };
    } catch (error) {
      console.error('Error during individual customer creation transaction:', error);
      // Use specific error class if defined, otherwise generic
      const message = error instanceof Error ? error.message : 'Failed to create individual customer record';
      throw new CustomerUpdateError(message, error); // Throw update error for consistency
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
      }

      revalidatePath('/customers');
      return { success: true };
    } catch (error) {
      console.error('Error during business customer creation transaction:', error);
      const message = error instanceof Error ? error.message : 'Failed to create business customer record';
      throw new CustomerUpdateError(message, error); // Throw update error for consistency
    }
  });
}

async function createBaseCustomer(
  tx: DatabaseTransaction,
  type: 'INDIVIDUAL' | 'BUSINESS',
  data: IndividualData | BusinessData
): Promise<string> {
  const [ result ] = await tx
    .insert(customers)
    .values({
      customerType: type,
      country: data.country,
      notes: data.notes,
      displayName: data.displayName,
      // zohoCustomerId: data.zohoCustomerId, // Assuming zoho ID might be part of creation data
    })
    .returning({ customerId: customers.customerId });

  if (!result?.customerId) {
    throw new CustomerUpdateError('Failed to create base customer record'); // Use update error
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
    middleName: data.middleName, // Add middleName if present in IndividualData
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
  const [ insertedAddress ] = await tx
    .insert(addressDetails)
    .values({
      ...address,
      addressType: "Customer Address", // Ensure type is set
    })
    .returning({ addressId: addressDetails.addressId });

  if (insertedAddress?.addressId) {
    await tx.insert(entityAddresses).values({
      entityId: customerId,
      addressId: insertedAddress.addressId,
      entityType: "CUSTOMER",
    });
  } else {
    throw new CustomerUpdateError('Failed to insert address details'); // Use update error
  }
}

async function createCustomerContacts(
  tx: DatabaseTransaction,
  customerId: string,
  contacts: z.infer<typeof CreateContactSchema>[]
): Promise<void> {
  if (!contacts || contacts.length === 0) return; // No contacts to create

  await Promise.all(
    contacts.map(async (contact) => {
      // Ensure required fields are present
      if (!contact.contact_type || !contact.contact_data) {
        console.warn("Skipping contact due to missing data:", contact);
        return; // Skip if essential data is missing
      }
      const [ insertedContact ] = await tx
        .insert(contactDetails)
        .values({
          contactType: contact.contact_type,
          contactData: contact.contact_data,
          isPrimary: contact.is_primary ?? false, // Default isPrimary if undefined
        })
        .returning({ contactId: contactDetails.contactDetailsId });

      if (insertedContact?.contactId) {
        await tx.insert(entityContactDetails).values({
          entityId: customerId,
          contactDetailsId: insertedContact.contactId,
          entityType: "CUSTOMER",
          contactType: contact.contact_type, // Store type in link table too
        });
      } else {
        throw new CustomerUpdateError('Failed to insert contact details'); // Use update error
      }
    })
  );
}

// --- CustomerCreationError Class (Keep if needed for create functions) ---
class CustomerCreationError extends Error {
  constructor(message: string, public readonly cause?: unknown) {
    super(message);
    this.name = 'CustomerCreationError';
  }
}
