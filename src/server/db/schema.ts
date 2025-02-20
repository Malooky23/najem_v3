import {
  pgTable,
  uuid,
  varchar,
  timestamp,
  serial,
  text,
  boolean,
  pgEnum,
  unique,
  integer,
  inet,
  json,
  check,
  primaryKey,
  foreignKey,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { relations } from 'drizzle-orm';
import { z } from 'zod'

export const userType = pgEnum("user_type", ["EMPLOYEE", "CUSTOMER", "DEMO"]);
export const customerType = pgEnum("customer_type", ["INDIVIDUAL", "BUSINESS"]);
export const contactType = pgEnum("contact_type", ['email', 'phone', 'mobile', 'landline', 'other']);
export const entityType = pgEnum("entity_type", ["CUSTOMER", "USER"]);
export const packingType = pgEnum("packing_type", [
  "SACK",
  "PALLET",
  "CARTON",
  "OTHER",
  "NONE",
]);
export const movementType = pgEnum("movement_type", ["IN", "OUT"]);
// export const addressType = pgEnum("address_type", ["PRIMARY", "BILLING", "SHIPPING"]);

//Contact Details such as Email
export const contactDetails = pgTable("contact_details", {
  contactDetailsId: uuid("contact_details_id").defaultRandom().primaryKey(),

  contactType: contactType("contact_type").notNull(),
  contactData: text("contact_data").notNull(),
  isPrimary: boolean("is_primary").default(false),

  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }),
});

export const entityContactDetails = pgTable("entity_contact_details", {
  id: uuid().defaultRandom().primaryKey().notNull(),

  entityId: uuid("entity_id").notNull(),
  entityType: text("entity_type").notNull(),
  contactDetailsId: uuid("contact_details_id")
    .references(() => contactDetails.contactDetailsId, { onDelete: "cascade" })
    .notNull(),
  // Optional: Add a "type" field (e.g., "primary", "billing")
  contactType: text("contact_type"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

// ADDRESS TABLE
export const addressDetails = pgTable("address_details", {
  addressId: uuid("address_id").defaultRandom().primaryKey(),

  address1: text("address_1"),
  address2: text("address_2"),
  city: text(),
  country: text(),
  postalCode: varchar("postal_code", { length: 20 }),

  addressType: text("address_type"),

  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }),
});

export const entityAddresses = pgTable("entity_addresses", {
  id: uuid().defaultRandom().primaryKey().notNull(),

  entityId: uuid("entity_id").notNull(),
  entityType: text("entity_type").notNull(),
  addressId: uuid("address_id")
    .references(() => addressDetails.addressId, { onDelete: "cascade" })
    .notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

//CUSTOMERS - Individual or Business
export const customers = pgTable("customers", {
  customerId: uuid("customer_id").defaultRandom().primaryKey().notNull(),
  customerNumber: serial("customer_number").notNull(),
  customerType: customerType("customer_type").notNull(),

  notes: text(),
  country: text().notNull(), //we need to specify customer country irregardles of address table.

  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }),
});

// export const customersRelations =  relations(customers, ({one}) => ({
//   individualCustomers: one(individualCustomers),
//   businessCustomers: one(businessCustomers),
// }));

// Individual Customer Details
export const individualCustomers = pgTable("individual_customers", {
  individualCustomerId: uuid("individual_customer_id")
    .primaryKey()
    .references(() => customers.customerId, { onDelete: "cascade" }),

  firstName: text("first_name").notNull(),
  middleName: text("middle_name"),
  lastName: text("last_name").notNull(),
  personalID: text("personal_id").unique(),

  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }),
});

// export const individualCustomersRelation =  relations(individualCustomers, ({one}) => ({
//   customer: one(customers, {fields: [individualCustomers.individualCustomerId], references: [customers.customerId]})
// }))

// Business Customer Details
export const businessCustomers = pgTable("business_customers", {
  businessCustomerId: uuid("business_customer_id")
    .primaryKey()
    .references(() => customers.customerId, { onDelete: "cascade" }),

  businessName: text("business_name").unique().notNull(),
  isTaxRegistered: boolean("is_tax_registered").default(false).notNull(),
  taxNumber: text("tax_number").unique(), //can be null, not all business have.

  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }),
});

// export const businessCustomersRelation =  relations(businessCustomers, ({one}) => ({
//   customer: one(customers, {fields: [businessCustomers.businessCustomerId], references: [customers.customerId]})
// }))

// Relations

//USERS
export const users = pgTable("users", {
  userId: uuid("user_id").defaultRandom().primaryKey().notNull(),

  email: text().notNull().unique(),
  passwordHash: text("password_hash").notNull(),

  firstName: varchar("first_name", { length: 50 }).notNull(),
  lastName: varchar("last_name", { length: 50 }).notNull(),

  userType: userType("user_type").default("CUSTOMER").notNull(),
  isAdmin: boolean("is_admin").default(false).notNull(),

  // CAN DEACTIVE ACCOUNTS
  isActive: boolean("is_active").default(true).notNull(),

  lastLogin: timestamp("last_login", { withTimezone: true, mode: "string" }),

  // Optional Customer Association
  customerId: uuid("customer_id").references(() => customers.customerId),

  loginCount: integer("login_count")
    .default(0)
    .$onUpdateFn(() => sql`login_count + 1`),

  createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", {
    withTimezone: true,
    mode: "string",
  }),
});

// SESSIONS
export const loginAttempts = pgTable("login_attempts", {
  loginAttemptId: serial("login_attempt_id").primaryKey().notNull(),
  userId: uuid("user_id").references(() => users.userId),
  success: boolean().default(false).notNull(),
  created_at: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  ip_address: inet("ip_address"),
  user_agent: text("user_agent"),
  error_message: text("error_message"),
});

// Add locations table (if not already present)
export const locations = pgTable("locations", {
  locationId: uuid("location_id").defaultRandom().primaryKey(),
  locationName: text("location_name").notNull(),
  locationCode: text("location_code").notNull().unique(),
  notes: text(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }),
});

// Item table
export const items = pgTable("items", {
  itemId: uuid("item_id").defaultRandom().primaryKey().notNull(),
  itemNumber: serial("item_number").notNull(),
  itemName: text("item_name").notNull().unique(),
  itemType: text("item_type"),
  itemBrand: text("item_brand"),
  itemModel: text("item_model"),
  itemBarcode: text("item_barcode").unique(),
  itemCountryOfOrigin: text("item_country_of_origin"),
  dimensions: json("dimensions"),
  weightGrams: integer("weight_grams"),
  // packingType: text("packing_type").default("NONE"),

  customerId: uuid("customer_id").notNull().references(() => customers.customerId, { onDelete: "restrict" }),

  notes: text(),
  createdBy: uuid("created_by").notNull().references(() => users.userId, { onDelete: "restrict" }),

  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),

  updatedAt: timestamp("updated_at", { withTimezone: true }),
  isDeleted: boolean().default(false),


  // THIS IS NOT WORKING
  //   updatedAt: timestamp("updated_at", { withTimezone: true }).$onUpdate(
  //     () => sql`CURRENT_TIMESTAMP`
  //   ),
});

// Inventory tracking tables
export const itemStock = pgTable("item_stock", {
  itemId: uuid("item_id")
    .notNull()
    .references(() => items.itemId),
  locationId: uuid("location_id")
    .notNull()
    .references(() => locations.locationId),
  currentQuantity: integer("current_quantity").notNull().default(0),
  lastUpdated: timestamp("last_updated", { withTimezone: true })
    .defaultNow()
    .notNull(),
},
  // (table) => ({
  //   pk: primaryKey({ columns: [table.itemId, table.locationId] }),
  //   quantityCheck: check("quantity_check", sql`current_quantity >= 0`),
  // })
);

export const stockMovements = pgTable("stock_movements", {
  movementId: uuid("movement_id").defaultRandom().primaryKey(),
  itemId: uuid("item_id")
    .notNull()
    .references(() => items.itemId),
  locationId: uuid("location_id")
    .notNull()
    .references(() => locations.locationId),
  movementType: movementType("movement_type").notNull(),
  quantity: integer("quantity").notNull(),
  referenceType: text("reference_type"),
  referenceId: uuid("reference_id"),
  notes: text(),
  createdBy: uuid("created_by")
    .notNull()
    .references(() => users.userId),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const deletedItems = pgTable('deleted_items', {
  itemId: uuid('item_id').primaryKey().notNull(),
  deletedAt: timestamp('deleted_at').defaultNow(),
});

export const orderStatus = pgEnum("order_status", ['DRAFT', 'PENDING', 'PROCESSING', 'READY', 'COMPLETED', 'CANCELLED'])
export const orderType = pgEnum("order_type", ['CUSTOMER_ORDER', ])
export const deliveryMethod = pgEnum("delivery_method", ['NONE', 'PICKUP', 'DELIVERY'])


export const orders = pgTable("orders", {
  orderId: uuid("order_id").primaryKey().notNull(),
  orderNumber: serial("order_number").notNull(),
  customerId: uuid("customer_id").notNull(),
  orderType: orderType("order_type").notNull().default('CUSTOMER_ORDER'),
  movement: movementType().notNull(),
  packingType: packingType("packing_type").notNull().default('NONE'),
  deliveryMethod: deliveryMethod("delivery_method").notNull().default('NONE'),
  status: orderStatus().default('PENDING').notNull(),
  addressId: uuid("address_id"),
  fulfilledAt: timestamp("fulfilled_at", { withTimezone: true }),
  notes: text(),

  createdBy: uuid("created_by").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true}),
  isDeleted: boolean().default(false),

},
  (table) => [
    foreignKey({
      columns: [table.createdBy],
      foreignColumns: [users.userId],
      name: "orders_creator_id_fkey"
    }).onDelete("restrict"),
    foreignKey({
      columns: [table.customerId],
      foreignColumns: [customers.customerId],
      name: "orders_cus_id_fkey"
    }).onDelete("restrict"),
    foreignKey({
      columns: [table.addressId],
      foreignColumns: [addressDetails.addressId],
      name: "orders_address_id_fkey"
    }).onDelete("set null"),
    unique("orders_order_number_key").on(table.orderNumber),
  ]);


  export const orderItems = pgTable("order_items", {
    orderItemsId: uuid("order_items_id").defaultRandom().primaryKey().notNull(),
    orderId: uuid("order_id").notNull(),
    itemId: uuid("item_id").notNull(),
    quantity: integer().notNull(),
    createdAt: timestamp("created_at", {withTimezone: true}).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", {withTimezone: true})
  }, (table) => [
    foreignKey({
        columns: [table.orderId],
        foreignColumns: [orders.orderId],
        name: "order_items_order_id_fkey"
    }).onDelete("cascade"),
    foreignKey({
        columns: [table.itemId],
        foreignColumns: [items.itemId],
        name: "order_items_item_id_fkey"
    }).onDelete("restrict"),
    check("order_items_quantity_check", sql`quantity
    > 0`),
  ]);

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export type Customer = typeof customers.$inferSelect;
export type InsertCustomer = typeof customers.$inferInsert;

export type IndividualCustomer = typeof individualCustomers.$inferSelect;
export type InsertIndividualCustomer = typeof individualCustomers.$inferInsert;

export type BusinessCustomer = typeof businessCustomers.$inferSelect;
export type InsertBusinessCustomer = typeof businessCustomers.$inferInsert;

export type ContactDetails = typeof contactDetails.$inferSelect;
export type InsertContactDetails = typeof contactDetails.$inferInsert;

export type EntityContactDetails = typeof entityContactDetails.$inferSelect;
export type InsertEntityContactDetails =
  typeof entityContactDetails.$inferInsert;

export type AddressDetails = typeof addressDetails.$inferSelect;
export type InsertAddressDetails = typeof addressDetails.$inferInsert;

export type EntityAddresses = typeof entityAddresses.$inferSelect;
export type InsertEntityAddresses = typeof entityAddresses.$inferInsert;

export type LoginAttempts = typeof loginAttempts.$inferSelect;
export type InsertLoginAttempts = typeof loginAttempts.$inferInsert;

export type Item = typeof items.$inferSelect;
export type InsertItem = typeof items.$inferInsert;
export type Location = typeof locations.$inferSelect;
export type InsertLocation = typeof locations.$inferInsert;
export type ItemStock = typeof itemStock.$inferSelect;
export type InsertItemStock = typeof itemStock.$inferInsert;
export type StockMovement = typeof stockMovements.$inferSelect;
export type InsertStockMovement = typeof stockMovements.$inferInsert;

export const customersRelations = relations(customers, ({ one, many }) => ({
  individual: one(individualCustomers, {
    fields: [customers.customerId],
    references: [individualCustomers.individualCustomerId],
    relationName: "customer_individual"
  }),
  business: one(businessCustomers, {
    fields: [customers.customerId],
    references: [businessCustomers.businessCustomerId],
    relationName: "customer_business"
  }),
  addresses: many(entityAddresses),
  contacts: many(entityContactDetails),
  users: many(users)
}));

// Individual Customer Relations
export const individualCustomersRelations = relations(individualCustomers, ({ one }) => ({
  customer: one(customers, {
    fields: [individualCustomers.individualCustomerId],
    references: [customers.customerId]
  })
}));

// Business Customer Relations
export const businessCustomersRelations = relations(businessCustomers, ({ one }) => ({
  customer: one(customers, {
    fields: [businessCustomers.businessCustomerId],
    references: [customers.customerId]
  })
}));


// User Relations
export const usersRelations = relations(users, ({ one, many }) => ({
  customer: one(customers, {
    fields: [users.customerId],
    references: [customers.customerId]
  }),
  loginAttempts: many(loginAttempts)
}));

// Contact Details Relations
export const contactDetailsRelations = relations(contactDetails, ({ many }) => ({
  entityRelations: many(entityContactDetails)
}));



// Entity Contact Details Relations
export const entityContactDetailsRelations = relations(entityContactDetails, ({ one }) => ({
  contactDetail: one(contactDetails, {
    fields: [entityContactDetails.contactDetailsId],
    references: [contactDetails.contactDetailsId]
  }),
  customer: one(customers, {
    fields: [entityContactDetails.entityId],
    references: [customers.customerId],
  })
  // You'll add similar relations for other entity types later:
  // order: one(orders, { ... }),
  // vendor: one(vendors, { ... }),
}));


// Address Details Relations
export const addressDetailsRelations = relations(addressDetails, ({ many }) => ({
  entityRelations: many(entityAddresses)
}));

// relations.ts
export const entityAddressesRelations = relations(entityAddresses, ({ one }) => ({
  address: one(addressDetails, {
    fields: [entityAddresses.addressId],
    references: [addressDetails.addressId]
  }),
  // For customer addresses
  customer: one(customers, {
    fields: [entityAddresses.entityId],
    references: [customers.customerId]
  })
  // You'll add similar relations for other entity types later:
  // order: one(orders, { ... }),
  // vendor: one(vendors, { ... }),
}));




// Login Attempts Relations
export const loginAttemptsRelations = relations(loginAttempts, ({ one }) => ({
  user: one(users, {
    fields: [loginAttempts.userId],
    references: [users.userId]
  })
}));