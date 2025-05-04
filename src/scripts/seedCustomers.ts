// /Users/malek/local_projects/najem_v3/src/scripts/seedCustomers.ts
import { db } from '@/server/db';
import {
    customers,
    individualCustomers,
    businessCustomers,
    addressDetails,
    entityAddresses,
    contactDetails,
    entityContactDetails,
    customerType,
    contactType,
} from '../server/db/schema';
import fs from 'fs';
import path from 'path';

// --- Type for JSON Data (optional but helpful) ---
interface CustomerJsonData {
    row: number;
    zohoCustomerId: number | string;
    displayName: string;
    customerType: 'business' | 'individual'; // Allow for potential variations
    companyName: string;
    firstName: string;
    lastName: string;
    notes: string;
    address1: string;
    address2: string;
    city: string;
    zohoCustomerNumber: string; // Assuming this isn't directly stored, maybe notes?
    country: string;
    postalCode: string | number;
    mobile: string | number;
    phone: string | number;
    phone1: string | number;
    email: string;
    taxNumber: number | string;
    customerId: string | null | undefined
}

// --- Helper Functions ---
function cleanString(value: any): string | null {
    if (typeof value === 'string') {
        const trimmed = value.trim();
        return trimmed === '' ? null : trimmed;
    }
    if (typeof value === 'number') {
        return String(value); // Convert numbers like taxNumber or postalCode to string
    }
    return null;
}

function cleanZohoId(value: any): string | null {
    const strValue = String(value).trim();
    return strValue === '' || strValue === '0' ? null : strValue;
}


// --- Main Seeding Function ---
async function seedCustomers() {
    console.log('Starting customer seeding...');
    const jsonPath = path.resolve('/Users/malek/local_projects/najem_v3/src/scripts/mergedCustomerData.json'); // Use absolute path
    if (!fs.existsSync(jsonPath)) {
        console.error(`Error: customerData.json not found at ${jsonPath}`);
        return;
    }

    let jsonData: CustomerJsonData[] 
    try {
        const fileContent = fs.readFileSync(jsonPath, 'utf-8');
        jsonData = JSON.parse(fileContent);
        console.log(`Read ${jsonData.length} records from JSON.`);
    } catch (error) {
        console.error('Error reading or parsing customerData.json:', error);
        return;
    }

    let successCount = 0;
    let skippedCount = 0;
    let errorCount = 0;

    for (const customerData of jsonData) {
        const rowNum = customerData.row;
        const displayName = cleanString(customerData.displayName);
        const type = customerData.customerType?.toLowerCase();
        const customerIdJSON = customerData.customerId

        // Basic validation: Skip if essential data is missing
        if (!displayName || (type !== 'business' && type !== 'individual')) {
            console.warn(`Skipping row ${rowNum}: Missing displayName or invalid customerType ('${customerData.customerType}').`);
            skippedCount++;
            continue;
        }

        // Determine customer type for the database enum
        const dbCustomerType = type === 'business' ? customerType.enumValues[ 1 ] : customerType.enumValues[ 0 ]; // BUSINESS or INDIVIDUAL

        try {
            await db.transaction(async (tx) => {
                // 1. Insert into 'customers' table
                const customerCountry = cleanString(customerData.country) ?? 'UAE'; // Fallback for country
                const insertedCustomer = await tx
                    .insert(customers)
                    .values({
                        displayName: displayName,
                        customerType: dbCustomerType,
                        zohoCustomerId: cleanZohoId(customerData.zohoCustomerId),
                        notes: cleanString(customerData.notes),
                        country: customerCountry, // Ensure country is not null
                        customerId: customerData.customerId ?? undefined
                    })
                    .returning({
                        customerId: customers.customerId,
                        customerNumber: customers.customerNumber,
                    });

                if (!insertedCustomer || insertedCustomer.length === 0) {
                    throw new Error(`Failed to insert base customer for row ${rowNum}`);
                }
                const { customerId, customerNumber } = insertedCustomer[ 0 ];
                console.log(`Inserted base customer ${customerNumber} (ID: ${customerId}) for row ${rowNum}`);

                // 2. Insert into 'individualCustomers' or 'businessCustomers'
                if (dbCustomerType === 'INDIVIDUAL') {
                    let firstName = cleanString(customerData.firstName);
                    let lastName = cleanString(customerData.lastName);

                    // Attempt to derive names if missing (simple split)
                    if (!firstName && !lastName && displayName) {
                        const nameParts = displayName.split(' ');
                        firstName = nameParts[ 0 ];
                        lastName = nameParts.slice(1).join(' ') || '--'; // Use '--' if only one name part
                    } else {
                        firstName = firstName || '--'; // Default if still missing
                        lastName = lastName || '--'; // Default if still missing
                    }


                    await tx.insert(individualCustomers).values({
                        individualCustomerId: customerId,
                        firstName: firstName,
                        lastName: lastName,
                        // personalID: null, // Assuming no personal ID in JSON
                    });
                    console.log(` -> Inserted individual details for customer ${customerNumber}`);

                } else if (dbCustomerType === 'BUSINESS') {
                    const businessName = cleanString(customerData.companyName) || displayName; // Fallback to displayName
                    const taxNumber = cleanString(customerData.taxNumber);
                    await tx.insert(businessCustomers).values({
                        businessCustomerId: customerId,
                        businessName: businessName,
                        taxNumber: taxNumber,
                        isTaxRegistered: !!taxNumber, // Set to true if taxNumber exists
                    });
                    console.log(` -> Inserted business details for customer ${customerNumber}`);
                }

                // 3. Handle Address
                const address1 = cleanString(customerData.address1);
                const address2 = cleanString(customerData.address2);
                const city = cleanString(customerData.city);
                const postalCode = cleanString(customerData.postalCode);
                const addressCountry = cleanString(customerData.country); // Use country specific to address if available

                if (address1 || city || addressCountry || postalCode) {
                    const insertedAddress = await tx
                        .insert(addressDetails)
                        .values({
                            address1: address1,
                            address2: address2,
                            city: city,
                            postalCode: postalCode,
                            country: addressCountry,
                            addressType: 'PRIMARY', // Defaulting address type
                        })
                        .returning({ addressId: addressDetails.addressId });

                    if (insertedAddress && insertedAddress.length > 0) {
                        const { addressId } = insertedAddress[ 0 ];
                        await tx.insert(entityAddresses).values({
                            entityId: customerId,
                            entityType: 'CUSTOMER',
                            addressId: addressId,
                        });
                        console.log(` -> Inserted address (ID: ${addressId}) for customer ${customerNumber}`);
                    } else {
                        console.warn(` -> Row ${rowNum}: Address data present but failed to insert address details.`);
                    }
                }

                // 4. Handle Contacts
                const contactsToInsert: { type: typeof contactType.enumValues[ number ]; data: string }[] = [];
                const email = cleanString(customerData.email);
                const mobile = cleanString(customerData.mobile);
                const phone = cleanString(customerData.phone);
                const phone1 = cleanString(customerData.phone1);

                if (email) contactsToInsert.push({ type: 'email', data: email });
                if (mobile) contactsToInsert.push({ type: 'mobile', data: mobile });
                if (phone) contactsToInsert.push({ type: 'phone', data: phone });
                if (phone1) contactsToInsert.push({ type: 'phone', data: phone1 }); // Treat phone1 as 'phone' or 'other'? Using 'phone'.

                for (const contact of contactsToInsert) {
                    const insertedContact = await tx
                        .insert(contactDetails)
                        .values({
                            contactType: contact.type,
                            contactData: contact.data,
                            isPrimary: contact.type === 'email' || contact.type === 'mobile', // Example: Mark email/mobile as primary
                        })
                        .returning({ contactDetailsId: contactDetails.contactDetailsId });

                    if (insertedContact && insertedContact.length > 0) {
                        const { contactDetailsId } = insertedContact[ 0 ];
                        await tx.insert(entityContactDetails).values({
                            entityId: customerId,
                            entityType: 'CUSTOMER',
                            contactDetailsId: contactDetailsId,
                            contactType: contact.type, // Optional: Redundant but might be useful context
                        });
                        console.log(` -> Inserted ${contact.type} contact (ID: ${contactDetailsId}) for customer ${customerNumber}`);
                    } else {
                        console.warn(` -> Row ${rowNum}: Failed to insert ${contact.type} contact details.`);
                    }
                }
            }); // End Transaction

            successCount++;
            console.log(`Successfully processed row ${rowNum}`);

        } catch (error: any) {
            errorCount++;
            console.error(`Error processing row ${rowNum} (Display Name: ${displayName}):`, error.message);
            // Optional: Log the full error or specific data for debugging
            // console.error("Data:", customerData);
            // console.error("Full Error:", error);
        }
        console.log('---'); // Separator between customer processing logs
    }

    console.log('\n--- Seeding Summary ---');
    console.log(`Total records in JSON: ${jsonData.length}`);
    console.log(`Successfully inserted: ${successCount}`);
    console.log(`Skipped (missing data): ${skippedCount}`);
    console.log(`Errors during insertion: ${errorCount}`);
    console.log('Customer seeding finished.');
}

// --- Run the Seeder ---
seedCustomers().catch((err) => {
    console.error('Unhandled error during seeding process:', err);
    process.exit(1);
});
