1: i refactored a bit and improved the structure, moving all page related stuff into (pages) including the (protected) folder which includes pages that you need to be logged in to view.

2: src/lib : im not entirely sure what needs to go in this folder but i have the following:

    2.1:  /auth: files relating to my auth. i am using AuthJS. so this folder has the needed files.

    2.2: /constants : has json files for stuff like countries list

    2.3: /validations: has contact.ts:
        /src/lib/validations/contact.ts
        import { z } from 'zod'
        export const contactTypeSchema = z.enum(['email', 'phone'])
        export const contactSchema = z.object({
        data: z.string()
            .min(1, 'Contact information is required')
            .refine((val) => {
            if (val.includes('@')) {
                return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)
            }
            return /^\+?[\d\s-]{7,}$/.test(val)
            }, 'Invalid contact format'),
        type: contactTypeSchema,
        isPrimary: z.boolean()
        })
        export const contactsArraySchema = z.array(contactSchema)
        .min(1, 'At least one contact is required')
        .refine(
            (contacts) => contacts.some((contact) => contact.isPrimary),
            'At least one contact must be primary'
        )
        export type ContactValidationType = z.infer<typeof contactSchema>
        Which is used in my contact-selection component which is used to add contact details. and i suppose this file is used for validating the inputs.
    2.4: validationsOLD - Deprecated.
    2.5: providers.tsx: contants my providers such as tanstack query and session, and i use it in my layout.tsx.
    2.6: utils.ts: created by shadcn and contains a cn function to merge stylying.

3: src/server: has server related files.
    3.1: server/db: contains files related to my db. such as where i initialize my db connection, and have some queries.
    3.2: get-stuff.ts is where i have functions that use tanstack query and returns the results. here is the file:
    export async function getCustomers(): Promise<EnrichedCustomer[]> {
        try {
            const rawCustomers = await QUERIES.getAllCustomersFULL();
            const validatedCustomers = z.array(customerSchema).parse(rawCustomers);
            return validatedCustomers; // Data is now validated and transformed (includes displayName)
        } catch (error) {
            if (error instanceof z.ZodError) {
            console.error("Data validation error:", JSON.stringify(error.errors, null, 2));
            throw new Error("Invalid data structure received from database");
            }
            console.error("Database query error:", error);
            throw new Error("Failed to fetch customers");
            }
        }

        export async function getItems(): Promise<ItemSchemaType[]> {
        try {
            const rawItems =  await db.query.items.findMany();
            const parsedItems = z.array(ItemSchema).parse(rawItems);
            return parsedItems;
        } catch (error) {
            if (error instanceof z.ZodError) {
            console.error("Data validation error:", JSON.stringify(error.errors, null, 2));
            throw new Error("Invalid data structure received from database");
            }
            console.error("Database query error:", error);
            throw new Error("Failed to fetch customers");
        }
        }
4: src/type i have some types definitions. common-types was an empty file so i deleted that.
    4.1: src/type/customers.ts:
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

    4.2: items.ts
        import { z } from "zod";

        export const createItemsSchema = z.object({
        itemName: z.string().min(1, "Required"),
        itemType: z.enum(["SACK", "PALLET", "CARTON", "OTHER", "NONE"]),
        itemBrand: z.string().optional(),
        itemModel: z.string().optional(),
        itemBarcode: z.string().optional(),
        itemCountryOfOrigin: z.string().optional(),
        weightGrams: z.number().nonnegative().optional(),
        dimensions: z
            .object({
            width: z.number().nonnegative(),
            height: z.number().nonnegative(),
            depth: z.number().nonnegative(),
            })
            .optional(),
        notes: z.string().optional(),
        });

        export const ItemSchema = z.object({
        itemId: z.string(),
        itemNumber: z.number(),
        itemName: z.string(),
        // itemType: z.enum(['EQUIPMENT','SACK','PALLET','CARTON','OTHER','BOX' ]),
        itemType: z.string().nullable(),
        itemBrand: z.string().nullable(),
        itemModel: z.string().nullable(),
        itemBarcode: z.string().nullable(),
        itemCountryOfOrigin: z.string().nullable(),
        dimensions: z.object({
            width: z.number().optional().nullable(),
            height: z.number().optional().nullable(),
            length: z.number().optional().nullable(),
        }).optional().nullable(),
        weightGrams: z.number().nullable(),
        customerId: z.string(),
        notes: z.string().nullable(),
        createdBy: z.string(),
        createdAt: z.date(),
        updatedAt: z.date().nullable(),
        isDeleted: z.boolean().default(false).nullable(),
        })

        export const EnrichedItemsSchema = ItemSchema.extend({
        customerDisplayName: z.string(), // Add the new field here, define its type
        });

        export type ItemSchemaType = z.infer< typeof ItemSchema>
        export type EnrichedItemsType = z.infer< typeof EnrichedItemsSchema>

    4.3: users.ts
        import { type User } from '@/server/db/schema'

        export interface UserType extends User {
            userId: string,
            email: string,
            firstName: string,
            lastName: string,
            userType: 'EMPLOYEE' | 'CUSTOMER' | 'DEMO'
            isAdmin: boolean,
            isActive: boolean,
            lastLogin: string,
            customerId: string | null,
            loginCount: number,
            createdAt: string,
            updatedAt: string | null
        } 

    Notice how in customers and items i have zod objects while in users i created an interface. what is the difference? and how to fix this.

5: src/validations i deleted as it was not used.

6: src/components/layout/header is used throught the project. While sidebar is only used in the (protected) route.

7: src/components/ui: reusable ui compontents 

8: src/hooks currently has:
    8.1: src/hooks/data-fetcher.ts which contains the following:
        export function useCustomers() {
        return useQuery({
            queryKey: ['customers'],
            queryFn: async () => {
            try {
                // await new Promise((resolve) => setTimeout(resolve, 2000))
                return await getCustomers();
                // return customers.map(customer => customerSchema.parse(customer));
            } catch (error) {
                console.error("Error fetching/validating customers:", error);
                throw error;
            }
            },
            refetchOnMount:false,
            refetchOnWindowFocus:false,
            staleTime: 100*100*100*100
        });
        }


        export function useItems() {
        return useQuery<ItemSchemaType[]>({
            queryKey: ['items'],
            queryFn: async () => {
            try {
                const response = await getItems();
                return response; // Make sure to return the data
            } catch (error) {
                console.error("Error items:", error);
                throw error;
            }
            },
            staleTime: 1000 * 60 * 5, // Optional: cache for 5 minutes
            refetchOnMount: false,
            refetchOnWindowFocus: false,
        });
        }
    I use these functions forexample in my table-wrapper components to get data that will be passed to the table components

9: src/server/db/functions contains sql functions that i deploy to my db. it just contains the functions so i can refer to them.
10: src/scripts just has some seeding scripts i wrote to have some data to dispay while i developt this project