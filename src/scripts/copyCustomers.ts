// import { db, db1 } from '../server/db';
// import { 
//     customers, 
//     individualCustomers, 
//     businessCustomers, 
//     contactDetails,
//     entityContactDetails,
//     addressDetails,
//     entityAddresses
// } from '../server/db/schema';
// import { eq } from 'drizzle-orm';

// export async function copyCustomers() {
//     try {
//         // Get first 10 customers from local database
//         const localCustomers = await db1.query.customers.findMany({
//             limit: 10,
//             with: {
//                 individual: true,
//                 business: true,
//                 contacts: {
//                     with: {
//                         contactDetail: true
//                     }
//                 },
//                 addresses: {
//                     with: {
//                         address: true
//                     }
//                 }
//             }
//         });

//         console.log(`Found ${localCustomers.length} customers to copy`);

//         for (const customer of localCustomers) {
//             // Check if customer already exists
//             const existingCustomer = await db.query.customers.findFirst({
//                 where: eq(customers.customerId, customer.customerId)
//             });

//             if (!existingCustomer) {
//                 // 1. Insert base customer record
//                 await db.insert(customers).values({
//                     // customerId: customer.customerId,
//                     // customerNumber: customer.customerNumber,
//                     // customerType: customer.customerType,
//                     // notes: customer.notes,
//                     // country: customer.country,
//                     // createdAt: customer.createdAt?.toString(),
//                     // updatedAt: customer.updatedAt?.toString()
//                     ...customer
//                 });

//                 // 2. Insert individual or business details
//                 if (customer.individual) {
//                     await db.insert(individualCustomers).values({
//                         // individualCustomerId: customer.customerId,
//                         // firstName: customer.individual.firstName,
//                         // middleName: customer.individual.middleName,
//                         // lastName: customer.individual.lastName,
//                         // personalID: customer.individual.personalID,
//                         // createdAt: customer.individual.createdAt?.toString(),
//                         // updatedAt: customer.individual.updatedAt?.toString()
//                         ...customer.individual
//                     });
//                 } else if (customer.business) {
//                     await db.insert(businessCustomers).values({
//                         // businessCustomerId: customer.customerId,
//                         // businessName: customer.business.businessName,
//                         // isTaxRegistered: customer.business.isTaxRegistered,
//                         // taxNumber: customer.business.taxNumber,
//                         // createdAt: customer.business.createdAt?.toString(),
//                         // updatedAt: customer.business.updatedAt?.toString()
//                         ...customer.business
//                     });
//                 }

//                 // 3. Copy contact details
//                 if (customer.contacts) {
//                     for (const contact of customer.contacts) {
//                         const contactDetail = contact.contactDetail;
//                         if (contactDetail) {
//                             // Insert contact details
//                             await db.insert(contactDetails).values({
//                                 // contactDetailsId: contactDetail.contactDetailsId,
//                                 // contactType: contactDetail.contactType,
//                                 // contactData: contactDetail.contactData,
//                                 // isPrimary: contactDetail.isPrimary,
//                                 // createdAt: contactDetail.createdAt?.toString(),
//                                 // updatedAt: contactDetail.updatedAt?.toString()
//                                 ...contactDetail
//                             });

//                             // Insert entity contact details association
//                             await db.insert(entityContactDetails).values({
//                                 id: contact.id,
//                                 entityId: contact.entityId,
//                                 entityType: contact.entityType,
//                                 contactDetailsId: contact.contactDetailsId,
//                                 contactType: contact.contactType,
//                                 createdAt: contact.createdAt
//                             });
//                         }
//                     }
//                 }

//                 // 4. Copy address details
//                 if (customer.addresses) {
//                     for (const entityAddress of customer.addresses) {
//                         const address = entityAddress.address;
//                         if (address) {
//                             // Insert address details
//                             await db.insert(addressDetails).values({
//                                 // addressId: address.addressId,
//                                 // address1: address.address1,
//                                 // address2: address.address2,
//                                 // city: address.city,
//                                 // country: address.country,
//                                 // postalCode: address.postalCode,
//                                 // addressType: address.addressType,
//                                 // createdAt: address.createdAt?.toString(),
//                                 // updatedAt: address.updatedAt?.toString()
//                                 ...address
//                             });

//                             // Insert entity address association
//                             await db.insert(entityAddresses).values({
//                                 id: entityAddress.id,
//                                 entityId: entityAddress.entityId,
//                                 entityType: entityAddress.entityType,
//                                 addressId: entityAddress.addressId,
//                                 createdAt: entityAddress.createdAt
//                             });
//                         }
//                     }
//                 }

//                 console.log(`Copied customer: ${customer.customerId}`);
//             } else {
//                 console.log(`Skipping existing customer: ${customer.customerId}`);
//             }
//         }

//         console.log('Customer copy completed successfully');
//     } catch (error) {
//         console.error('Error copying customers:', error);
//         throw error;
//     }
// }
