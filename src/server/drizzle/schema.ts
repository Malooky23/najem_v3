import { pgTable, uuid, text, varchar, timestamp, foreignKey, unique, serial, json, integer, boolean, inet, primaryKey, check, pgEnum } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"

export const contactType = pgEnum("contact_type", ['email', 'phone', 'mobile', 'landline', 'other'])
export const customerType = pgEnum("customer_type", ['INDIVIDUAL', 'BUSINESS'])
export const entityType = pgEnum("entity_type", ['CUSTOMER', 'USER'])
export const movementType = pgEnum("movement_type", ['IN', 'OUT'])
export const packingType = pgEnum("packing_type", ['SACK', 'PALLET', 'CARTON', 'OTHER', 'NONE'])
export const userType = pgEnum("user_type", ['EMPLOYEE', 'CUSTOMER', 'DEMO'])


export const addressDetails = pgTable("address_details", {
	addressId: uuid("address_id").defaultRandom().primaryKey().notNull(),
	address1: text("address_1"),
	address2: text("address_2"),
	city: text(),
	country: text(),
	postalCode: varchar("postal_code", { length: 20 }),
	addressType: text("address_type"),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }),
});

export const individualCustomers = pgTable("individual_customers", {
	individualCustomerId: uuid("individual_customer_id").primaryKey().notNull(),
	firstName: text("first_name").notNull(),
	middleName: text("middle_name"),
	lastName: text("last_name").notNull(),
	personalId: text("personal_id"),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }),
}, (table) => [
	foreignKey({
			columns: [table.individualCustomerId],
			foreignColumns: [customers.customerId],
			name: "individual_customers_individual_customer_id_customers_customer_"
		}).onDelete("cascade"),
	unique("individual_customers_personal_id_unique").on(table.personalId),
]);

export const entityAddresses = pgTable("entity_addresses", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	entityId: uuid("entity_id").notNull(),
	entityType: text("entity_type").notNull(),
	addressId: uuid("address_id").notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.addressId],
			foreignColumns: [addressDetails.addressId],
			name: "entity_addresses_address_id_address_details_address_id_fk"
		}).onDelete("cascade"),
]);

export const deletedItems = pgTable("deleted_items", {
	itemId: uuid("item_id").primaryKey().notNull(),
	deletedAt: timestamp("deleted_at", { mode: 'string' }).defaultNow(),
});

export const entityContactDetails = pgTable("entity_contact_details", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	entityId: uuid("entity_id").notNull(),
	entityType: text("entity_type").notNull(),
	contactDetailsId: uuid("contact_details_id").notNull(),
	contactType: text("contact_type"),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.contactDetailsId],
			foreignColumns: [contactDetails.contactDetailsId],
			name: "entity_contact_details_contact_details_id_contact_details_conta"
		}).onDelete("cascade"),
]);

export const items = pgTable("items", {
	itemId: uuid("item_id").defaultRandom().primaryKey().notNull(),
	itemNumber: serial("item_number").notNull(),
	itemName: text("item_name").notNull(),
	itemType: text("item_type"),
	itemBrand: text("item_brand"),
	itemModel: text("item_model"),
	itemBarcode: text("item_barcode"),
	itemCountryOfOrigin: text("item_country_of_origin"),
	dimensions: json(),
	weightGrams: integer("weight_grams"),
	customerId: uuid("customer_id").notNull(),
	notes: text(),
	createdBy: uuid("created_by").notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }),
	isDeleted: boolean().default(false),
}, (table) => [
	foreignKey({
			columns: [table.customerId],
			foreignColumns: [customers.customerId],
			name: "items_customer_id_customers_customer_id_fk"
		}).onDelete("restrict"),
	foreignKey({
			columns: [table.createdBy],
			foreignColumns: [users.userId],
			name: "items_created_by_users_user_id_fk"
		}).onDelete("restrict"),
	unique("items_item_name_key").on(table.itemName),
	unique("items_item_barcode_unique").on(table.itemBarcode),
]);

export const customers = pgTable("customers", {
	customerId: uuid("customer_id").defaultRandom().primaryKey().notNull(),
	customerNumber: serial("customer_number").notNull(),
	customerType: customerType("customer_type").notNull(),
	notes: text(),
	country: text().notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }),
});

export const contactDetails = pgTable("contact_details", {
	contactDetailsId: uuid("contact_details_id").defaultRandom().primaryKey().notNull(),
	contactData: text("contact_data").notNull(),
	isPrimary: boolean("is_primary").default(false),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }),
	contactType: contactType("contact_type"),
});

export const loginAttempts = pgTable("login_attempts", {
	loginAttemptId: serial("login_attempt_id").primaryKey().notNull(),
	userId: uuid("user_id"),
	success: boolean().default(false).notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	ipAddress: inet("ip_address"),
	userAgent: text("user_agent"),
	errorMessage: text("error_message"),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.userId],
			name: "login_attempts_user_id_users_user_id_fk"
		}),
]);

export const stockMovements = pgTable("stock_movements", {
	movementId: uuid("movement_id").defaultRandom().primaryKey().notNull(),
	itemId: uuid("item_id").notNull(),
	locationId: uuid("location_id").notNull(),
	movementType: movementType("movement_type").notNull(),
	quantity: integer().notNull(),
	referenceType: text("reference_type"),
	referenceId: uuid("reference_id"),
	notes: text(),
	createdBy: uuid("created_by").notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.itemId],
			foreignColumns: [items.itemId],
			name: "stock_movements_item_id_items_item_id_fk"
		}),
	foreignKey({
			columns: [table.locationId],
			foreignColumns: [locations.locationId],
			name: "stock_movements_location_id_locations_location_id_fk"
		}),
	foreignKey({
			columns: [table.createdBy],
			foreignColumns: [users.userId],
			name: "stock_movements_created_by_users_user_id_fk"
		}),
]);

export const locations = pgTable("locations", {
	locationId: uuid("location_id").defaultRandom().primaryKey().notNull(),
	locationName: text("location_name").notNull(),
	locationCode: text("location_code").notNull(),
	notes: text(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }),
}, (table) => [
	unique("locations_location_code_unique").on(table.locationCode),
]);

export const businessCustomers = pgTable("business_customers", {
	businessCustomerId: uuid("business_customer_id").primaryKey().notNull(),
	businessName: text("business_name").notNull(),
	isTaxRegistered: boolean("is_tax_registered").default(false).notNull(),
	taxNumber: text("tax_number"),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }),
}, (table) => [
	foreignKey({
			columns: [table.businessCustomerId],
			foreignColumns: [customers.customerId],
			name: "business_customers_business_customer_id_customers_customer_id_f"
		}).onDelete("cascade"),
	unique("business_customers_business_name_unique").on(table.businessName),
	unique("business_customers_tax_number_unique").on(table.taxNumber),
]);

export const users = pgTable("users", {
	userId: uuid("user_id").defaultRandom().primaryKey().notNull(),
	email: text().notNull(),
	passwordHash: text("password_hash").notNull(),
	firstName: varchar("first_name", { length: 50 }).notNull(),
	lastName: varchar("last_name", { length: 50 }).notNull(),
	userType: userType("user_type").default('CUSTOMER').notNull(),
	isAdmin: boolean("is_admin").default(false).notNull(),
	isActive: boolean("is_active").default(true).notNull(),
	lastLogin: timestamp("last_login", { withTimezone: true, mode: 'string' }),
	customerId: uuid("customer_id"),
	loginCount: integer("login_count").default(0),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }),
}, (table) => [
	foreignKey({
			columns: [table.customerId],
			foreignColumns: [customers.customerId],
			name: "users_customer_id_customers_customer_id_fk"
		}),
	unique("users_email_unique").on(table.email),
]);

export const itemStock = pgTable("item_stock", {
	itemId: uuid("item_id").notNull(),
	locationId: uuid("location_id").notNull(),
	currentQuantity: integer("current_quantity").default(0).notNull(),
	lastUpdated: timestamp("last_updated", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.locationId],
			foreignColumns: [locations.locationId],
			name: "item_stock_location_id_locations_location_id_fk"
		}),
	foreignKey({
			columns: [table.itemId],
			foreignColumns: [items.itemId],
			name: "item_stock_item_id_items_item_id_fk"
		}),
	primaryKey({ columns: [table.itemId, table.locationId], name: "item_stock_item_id_location_id_pk"}),
	check("quantity_check", sql`current_quantity >= 0`),
]);
