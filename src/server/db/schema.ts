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
  pgView,
  pgMaterializedView,
  numeric,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { sql, eq } from "drizzle-orm";
import { relations } from 'drizzle-orm';
import { number, z } from 'zod'
import { createInsertSchema } from "drizzle-zod";
import { tax_id } from "@/types/types.zoho";


export const userType = pgEnum("user_type", [ "EMPLOYEE", "CUSTOMER", "DEMO" ])
export const userTypeSchema = z.enum(userType.enumValues);

export const customerType = pgEnum("customer_type", [ "INDIVIDUAL", "BUSINESS" ]);
export const customerTypeSchema = z.enum(customerType.enumValues);

export const contactType = pgEnum("contact_type", [ 'email', 'phone', 'mobile', 'landline', 'other' ]);
export const contactTypeSchema = z.enum(contactType.enumValues);

export const entityType = pgEnum("entity_type", [ "CUSTOMER", "USER" ]);
export const entityTypeSchema = z.enum(entityType.enumValues);


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
  displayName: varchar("display_name", { length: 100 }).notNull(),
  customerType: customerType("customer_type").notNull(),
  zohoCustomerId: text("zoho_customer_id"),

  notes: text(),
  country: text().notNull(), //we need to specify customer country irregardles of address table.

  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }),
  isDeleted: boolean("is_deleted").default(false)
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

export const itemTypes = pgEnum("item_type", [ "SACK", "PALLET", "CARTON", "OTHER", "BOX", "EQUIPMENT", "CAR", "SINGLE", "ROLL" ]);
export const itemTypesSchema = z.enum(itemTypes.enumValues);

export const items = pgTable("items", {
  itemId: uuid("item_id").defaultRandom().primaryKey().notNull(),
  itemNumber: serial("item_number").notNull(),
  itemName: text("item_name").notNull().unique(),
  // itemType: text("item_type").default("OTHER").notNull(),
  itemType: itemTypes("item_type").default("OTHER").notNull(),
  itemBrand: text("item_brand"),
  itemModel: text("item_model"),
  itemBarcode: text("item_barcode").unique(),
  itemCountryOfOrigin: text("item_country_of_origin"),
  dimensions: json("dimensions"), //DIMENSIONS SAVED IN mm milimeter
  weightGrams: integer("weight_grams"),
  allowNegative: boolean("allow_Negative").default(false),
  // packingType: text("packing_type").default("NONE"),

  customerId: uuid("customer_id").notNull().references(() => customers.customerId, { onDelete: "restrict" }),

  notes: text(),
  createdBy: uuid("created_by").notNull().references(() => users.userId, { onDelete: "restrict" }),

  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),

  updatedAt: timestamp("updated_at", { withTimezone: true }),
  isDeleted: boolean("is_deleted").default(false),

});


export const itemStock = pgTable("item_stock", {
  itemId: uuid("item_id").notNull().references(() => items.itemId),
  locationId: uuid("location_id").notNull().references(() => locations.locationId),
  currentQuantity: integer("current_quantity").notNull().default(0),
  lastUpdated: timestamp("last_updated", { withTimezone: true }).defaultNow().notNull(),
  lastMovementId: uuid("last_movement_id").references(() => stockMovements.movementId),
  lastReconciliationAt: timestamp("last_reconciliation_at", { withTimezone: true }),
  lastReconciliationBy: uuid("last_reconciliation_by").references(() => users.userId),
},
  (table) => [
    primaryKey({ columns: [ table.itemId, table.locationId ] }),
    // check("quantity_check", sql`current_quantity >= 0`)
  ]);

export const stockReconciliation = pgTable("stock_reconciliation", {
  reconciliationId: uuid("reconciliation_id").defaultRandom().primaryKey(),
  itemId: uuid("item_id").notNull().references(() => items.itemId),
  locationId: uuid("location_id").notNull().references(() => locations.locationId),
  expectedQuantity: integer("expected_quantity").notNull(),
  actualQuantity: integer("actual_quantity").notNull(),
  discrepancy: integer("discrepancy").notNull(),
  notes: text("notes"),
  reconciliationDate: timestamp("reconciliation_date", { withTimezone: true }).defaultNow().notNull(),
  performedBy: uuid("performed_by").notNull().references(() => users.userId),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});



export const deletedItems = pgTable('deleted_items', {
  itemId: uuid('item_id').primaryKey().notNull(),
  deletedAt: timestamp('deleted_at').defaultNow(),
});


export const movementType = pgEnum("movement_type", [ "IN", "OUT" ]);
export const movementTypeSchema = z.enum(movementType.enumValues);

export const orderStatus = pgEnum("order_status", [ 'DRAFT', 'PENDING', 'PROCESSING', 'READY', 'COMPLETED', 'CANCELLED' ]);
export const orderStatusSchema = z.enum(orderStatus.enumValues);

export const orderType = pgEnum("order_type", [ 'CUSTOMER_ORDER', 'SHIPMENT_ORDER', 'WAREHOUSE_ORDER' ])
export const orderTypeSchema = z.enum(orderType.enumValues)

export const deliveryMethod = pgEnum("delivery_method", [ 'NONE', 'PICKUP', 'DELIVERY' ])
export const deliveryMethodSchema = z.enum(deliveryMethod.enumValues)

export const packingType = pgEnum("packing_type", [ "SACK", "PALLET", "CARTON", "OTHER", "NONE" ]);
export const packingTypeSchema = z.enum(packingType.enumValues)

export const orders = pgTable("orders", {
  orderId: uuid("order_id").primaryKey().defaultRandom().notNull(),
  orderNumber: serial("order_number").notNull(),
  customerId: uuid("customer_id").notNull(),
  orderType: orderType("order_type").notNull(),
  movement: movementType().notNull(),
  packingType: packingType("packing_type").notNull().default('NONE'),
  deliveryMethod: deliveryMethod("delivery_method").notNull().default('NONE'),
  status: orderStatus().default('PENDING').notNull(),
  addressId: uuid("address_id"),
  fulfilledAt: timestamp("fulfilled_at", { withTimezone: true }),
  notes: text(),
  orderMark: varchar("order_mark", { length: 30 }),
  createdBy: uuid("created_by").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }),
  isDeleted: boolean("is_deleted").default(false),

  zohoInvoiceID: text("zoho_invoice_id"),
  zohoInvoiceNumber: text("zoho_invoice_number"),
},
  (table) => [
    foreignKey({
      columns: [ table.createdBy ],
      foreignColumns: [ users.userId ],
      name: "orders_creator_id_fkey"
    }).onDelete("restrict"),
    foreignKey({
      columns: [ table.customerId ],
      foreignColumns: [ customers.customerId ],
      name: "orders_cus_id_fkey"
    }).onDelete("restrict"),
    foreignKey({
      columns: [ table.addressId ],
      foreignColumns: [ addressDetails.addressId ],
      name: "orders_address_id_fkey"
    }).onDelete("set null"),
    unique("orders_order_number_key").on(table.orderNumber),
  ]);

export const orderInsertSchema = createInsertSchema(orders);


export const orderItems = pgTable("order_items", {
  orderItemsId: uuid("order_items_id").defaultRandom().primaryKey().notNull(),
  orderId: uuid("order_id").notNull(),
  itemId: uuid("item_id").notNull(),
  itemLocationId: uuid("item_location_id"),
  quantity: integer().notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
}, (table) => [
  foreignKey({
    columns: [ table.itemLocationId ],
    foreignColumns: [ locations.locationId ],
    name: "orderItems_locations_location_id_fkey"
  }).onDelete("restrict"),
  foreignKey({
    columns: [ table.orderId ],
    foreignColumns: [ orders.orderId ],
    name: "order_items_order_id_fkey"
  }).onDelete("cascade"),
  foreignKey({
    columns: [ table.itemId ],
    foreignColumns: [ items.itemId ],
    name: "order_items_item_id_fkey"
  }).onDelete("restrict"),
  check("order_items_quantity_check", sql`quantity
    > 0`),
]);



export const orderHistoryType = pgEnum("order_history_type", [
  'STATUS_CHANGE',
  'MOVEMENT_CHANGE',
  'ITEMS_CHANGE',
  'ADDRESS_CHANGE',
  'DELIVERY_METHOD_CHANGE',
  'CUSTOMER_CHANGE',
  'PACKING_TYPE_CHANGE',
  'NOTES_CHANGE'
]);

export const orderHistory = pgTable("order_history", {
  historyId: uuid("history_id").defaultRandom().primaryKey(),
  orderId: uuid("order_id")
    .notNull()
    .references(() => orders.orderId, { onDelete: "cascade" }),

  // What changed
  changeType: orderHistoryType("change_type").notNull(),

  // Store the changes
  previousValues: json("previous_values").notNull(),
  newValues: json("new_values").notNull(),

  // Who made the change
  changedBy: uuid("changed_by")
    .notNull()
    .references(() => users.userId),

  // When the change was made
  changedAt: timestamp("changed_at", { withTimezone: true })
    .defaultNow()
    .notNull(),

  // Optional note about the change
  changeNote: text("change_note"),
});

// Add to your existing relations
export const orderHistoryRelations = relations(orderHistory, ({ one }) => ({
  order: one(orders, {
    fields: [ orderHistory.orderId ],
    references: [ orders.orderId ],
  }),
  user: one(users, {
    fields: [ orderHistory.changedBy ],
    references: [ users.userId ],
  }),
}));

export const expenseCategoryType = pgEnum("expense_category_type", [ "LABOUR", "FORKLIFT", "PACKING" ])
export const expenseCategoryTypeSchema = z.enum(expenseCategoryType.enumValues)

export const zohoTaxType = pgEnum("zoho_tax_type", [ tax_id.five, tax_id.zero ])
export const zohoTaxTypeSchema = z.enum(zohoTaxType.enumValues)

export const expenseItems = pgTable("expense_items", {
  expenseItemId: uuid("expense_item_id").defaultRandom().primaryKey(),
  expenseName: text("expense_name").notNull(),
  defaultExpensePrice: numeric("default_expense_price").notNull(),
  expenseCategory: expenseCategoryType("expense_category"),
  notes: text(),
  createdBy: uuid("created_by"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }),

  zohoItemId: text("zoho_item_id"),
  zohoTaxId: zohoTaxType().default(tax_id.five),
})

export const orderExpenseStatusTypes = pgEnum("order_expense_status_types", [
  "PENDING", "DONE", "CANCELLED"
])
export const orderExpenseStatusTypesSchema = z.enum(orderExpenseStatusTypes.enumValues)

export const orderExpenses = pgTable("order_expenses", {
  orderExpenseId: uuid("order_expense_id").defaultRandom().primaryKey(),
  orderId: uuid("order_id").notNull().references(() => orders.orderId),
  expenseItemId: uuid("expense_item_id").notNull().references(() => expenseItems.expenseItemId),
  expenseItemPrice: numeric("expense_item_price").notNull().default("0"),
  expenseItemQuantity: integer("expense_item_quantity").notNull(),
  status: orderExpenseStatusTypes("status").default("PENDING"),
  notes: text(),
  createdBy: uuid("created_by").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }),
},
  (table) => {
    return {
      // Add a unique index on orderExpenseId
      // { { uniqueIndex("order_expenses_order_expense_id_unique").on(table.orderExpenseId) } }
    // Add a composite unique index to prevent duplicating the same expense item on the same order
    // orderItemUnique: uniqueIndex("order_expenses_order_id_expense_item_id_unique").on(
    //   table.orderId,
    //   table.expenseItemId,
    // ),
  }
}
)

export const sackSizeType = pgEnum("sack_size_type", [ "LARGE", "SMALL", 
  "OTHER"
 ])
export const sackSizeTypeSchema = z.enum(sackSizeType.enumValues)

export const sackSizeTracker = pgTable("sack_size_tracker", {
  id: uuid().defaultRandom().primaryKey(),
  orderExpensesId: uuid("order_expenses_id").notNull().references(() => orderExpenses.orderExpenseId),
  sackType: sackSizeType("sack_type").notNull().default("OTHER"),
  amount: integer().notNull(),
  createdBy: uuid("created_by").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'string', }).defaultNow().notNull().$onUpdate(() => sql`now()`),
})

export const orderExpenseDetailsMaterializedView = pgMaterializedView('order_expense_details_mv')
  .as((qb) => qb.select({
    orderExpenseId: orderExpenses.orderExpenseId,
    orderId: orderExpenses.orderId,
    expenseItemId: orderExpenses.expenseItemId,
    expenseItemQuantity: orderExpenses.expenseItemQuantity,
    expenseName: expenseItems.expenseName,
    expensePrice: orderExpenses.expenseItemPrice,
    expenseCategory: expenseItems.expenseCategory,
    totalExpensePrice: sql<number>`${orderExpenses.expenseItemQuantity} * ${orderExpenses.expenseItemPrice}`.mapWith(Number).as('total_expense_price') // Give the calculated column an alias
  })
    .from(orderExpenses)
    .innerJoin(expenseItems, eq(orderExpenses.expenseItemId, expenseItems.expenseItemId))
  );

export const stockMovements = pgTable("stock_movements", {
  movementId: uuid("movement_id").defaultRandom().primaryKey(),
  movementNumber: serial("movement_number").notNull(),

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
    // .notNull()   //MAKE NULLABLE TO ALLOW ORDER=COMPLETED TRIGGER TO UPDATE STOCK
    .references(() => users.userId),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

// Types
export type OrderHistory = typeof orderHistory.$inferSelect;
export type InsertOrderHistory = typeof orderHistory.$inferInsert;


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
    fields: [ customers.customerId ],
    references: [ individualCustomers.individualCustomerId ],
    relationName: "customer_individual"
  }),
  business: one(businessCustomers, {
    fields: [ customers.customerId ],
    references: [ businessCustomers.businessCustomerId ],
    relationName: "customer_business"
  }),
  addresses: many(entityAddresses),
  contacts: many(entityContactDetails),
  users: many(users)
}));

// Individual Customer Relations
export const individualCustomersRelations = relations(individualCustomers, ({ one }) => ({
  customer: one(customers, {
    fields: [ individualCustomers.individualCustomerId ],
    references: [ customers.customerId ]
  })
}));

// Business Customer Relations
export const businessCustomersRelations = relations(businessCustomers, ({ one }) => ({
  customer: one(customers, {
    fields: [ businessCustomers.businessCustomerId ],
    references: [ customers.customerId ]
  })
}));


// User Relations
export const usersRelations = relations(users, ({ one, many }) => ({
  customer: one(customers, {
    fields: [ users.customerId ],
    references: [ customers.customerId ]
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
    fields: [ entityContactDetails.contactDetailsId ],
    references: [ contactDetails.contactDetailsId ]
  }),
  customer: one(customers, {
    fields: [ entityContactDetails.entityId ],
    references: [ customers.customerId ],
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
    fields: [ entityAddresses.addressId ],
    references: [ addressDetails.addressId ]
  }),
  // For customer addresses
  customer: one(customers, {
    fields: [ entityAddresses.entityId ],
    references: [ customers.customerId ]
  })
  // You'll add similar relations for other entity types later:
  // order: one(orders, { ... }),
  // vendor: one(vendors, { ... }),
}));




// Login Attempts Relations
export const loginAttemptsRelations = relations(loginAttempts, ({ one }) => ({
  user: one(users, {
    fields: [ loginAttempts.userId ],
    references: [ users.userId ]
  })
}));

export const itemsRelations = relations(items, ({ one, many }) => ({
  itemStock: many(itemStock),
  customer: one(customers, {
    fields: [ items.customerId ],
    references: [ customers.customerId ],
    relationName: "item_customer_relation"
  }),
}));
// stockMovements: many(stockMovements),
// orderItems: many(orderItems),

export const customerRelations = relations(customers, ({ one, many }) => ({
  customerItems: many(items)
}));

export const itemStockRelations = relations(itemStock, ({ one }) => ({
  item: one(items, {
    fields: [ itemStock.itemId ],
    references: [ items.itemId ],
    relationName: "item_stock_relation"
  }),
  location: one(locations, {
    fields: [ itemStock.locationId ],
    references: [ locations.locationId ]
  })
}));


export const stockMovementsView = pgMaterializedView("stock_movements_view", {
  movementId: uuid("movement_id").notNull(),
  movementNumber: integer("movement_number").notNull(),
  itemId: uuid("item_id").notNull(),
  locationId: uuid("location_id").notNull(),
  movementType: text("movement_type").notNull(),
  quantity: integer("quantity").notNull(),
  referenceType: text("reference_type"),
  referenceId: uuid("reference_id"),
  notes: text("notes"),
  createdBy: uuid("created_by"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
  itemName: text("item_name").notNull(),
  customerId: uuid("customer_id").notNull(),
  customerDisplayName: varchar("customer_display_name", { length: 100 }), // Match length from customers table
  stockLevelAfter: integer("stock_level_after"), // Use numeric for SUM OVER window function result
}).as(sql`
    WITH MovementBalances AS (
      SELECT
        sm.movement_id,
        sm.movement_number,
        sm.item_id,
        sm.location_id,
        sm.movement_type,
        sm.quantity,
        sm.reference_type,
        sm.reference_id,
        sm.notes,
        sm.created_by,
        sm.created_at,
        SUM(CASE
          WHEN sm.movement_type = 'IN' THEN sm.quantity
          ELSE -sm.quantity
        END) OVER (
          PARTITION BY sm.item_id, sm.location_id
          ORDER BY sm.created_at
          ROWS UNBOUNDED PRECEDING
        ) as stock_level_after
      FROM ${stockMovements} sm
    )
    SELECT
      mb.movement_id,
      mb.movement_number,
      mb.item_id,
      mb.location_id,
      mb.movement_type,
      mb.quantity,
      mb.reference_type,
      mb.reference_id,
      mb.notes,
      mb.created_by,
      mb.created_at,
      i.item_name,
      i.customer_id,
      c.display_name AS customer_display_name,
      mb.stock_level_after
    FROM
      MovementBalances mb
    JOIN
      ${items} i ON mb.item_id = i.item_id
    JOIN
      ${customers} c ON i.customer_id = c.customer_id
  `);

export type StockMovementsView = typeof stockMovementsView.$inferSelect;


export const enrichedOrderExpenseView = pgView("enriched_order_expense_view") // Name the view in the database
  .as((qb) => // Define the query builder function
    qb
      .select({ // Select the columns for the view
        // Columns from orderExpenses (matching orderExpenseSchema)
        orderExpenseId: orderExpenses.orderExpenseId,
        orderId: orderExpenses.orderId,
        expenseItemId: orderExpenses.expenseItemId,
        expenseItemQuantity: orderExpenses.expenseItemQuantity,
        notes: orderExpenses.notes,
        status: orderExpenses.status,
        createdBy: orderExpenses.createdBy,
        createdAt: orderExpenses.createdAt,
        updatedAt: orderExpenses.updatedAt,

        // Enriched columns
        orderNumber: orders.orderNumber,
        customerId: orders.customerId,
        customerName: customers.displayName, // Drizzle might automatically handle aliasing here if the target name matches the original name, but explicit is safer if different. Let's stick with the direct name first. If it needs aliasing: customers.displayName.as('customerName')
        expenseItemName: expenseItems.expenseName,
        expenseItemCategory: expenseItems.expenseCategory,
        expenseItemPrice: orderExpenses.expenseItemPrice
      })
      .from(orderExpenses)
      .innerJoin(expenseItems, eq(orderExpenses.expenseItemId, expenseItems.expenseItemId)) // Join orderExpenses -> orders
      .innerJoin(orders, eq(orderExpenses.orderId, orders.orderId)) // Join orderExpenses -> orders
      .innerJoin(customers, eq(orders.customerId, customers.customerId)) // Join orders -> customers
  )
