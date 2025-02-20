import { relations } from "drizzle-orm/relations";
import { customers, individualCustomers, addressDetails, entityAddresses, contactDetails, entityContactDetails, items, users, loginAttempts, stockMovements, locations, businessCustomers, itemStock } from "./schema";

export const individualCustomersRelations = relations(individualCustomers, ({one}) => ({
	customer: one(customers, {
		fields: [individualCustomers.individualCustomerId],
		references: [customers.customerId]
	}),
}));

export const customersRelations = relations(customers, ({many}) => ({
	individualCustomers: many(individualCustomers),
	items: many(items),
	businessCustomers: many(businessCustomers),
	users: many(users),
}));

export const entityAddressesRelations = relations(entityAddresses, ({one}) => ({
	addressDetail: one(addressDetails, {
		fields: [entityAddresses.addressId],
		references: [addressDetails.addressId]
	}),
}));

export const addressDetailsRelations = relations(addressDetails, ({many}) => ({
	entityAddresses: many(entityAddresses),
}));

export const entityContactDetailsRelations = relations(entityContactDetails, ({one}) => ({
	contactDetail: one(contactDetails, {
		fields: [entityContactDetails.contactDetailsId],
		references: [contactDetails.contactDetailsId]
	}),
}));

export const contactDetailsRelations = relations(contactDetails, ({many}) => ({
	entityContactDetails: many(entityContactDetails),
}));

export const itemsRelations = relations(items, ({one, many}) => ({
	customer: one(customers, {
		fields: [items.customerId],
		references: [customers.customerId]
	}),
	user: one(users, {
		fields: [items.createdBy],
		references: [users.userId]
	}),
	stockMovements: many(stockMovements),
	itemStocks: many(itemStock),
}));

export const usersRelations = relations(users, ({one, many}) => ({
	items: many(items),
	loginAttempts: many(loginAttempts),
	stockMovements: many(stockMovements),
	customer: one(customers, {
		fields: [users.customerId],
		references: [customers.customerId]
	}),
}));

export const loginAttemptsRelations = relations(loginAttempts, ({one}) => ({
	user: one(users, {
		fields: [loginAttempts.userId],
		references: [users.userId]
	}),
}));

export const stockMovementsRelations = relations(stockMovements, ({one}) => ({
	item: one(items, {
		fields: [stockMovements.itemId],
		references: [items.itemId]
	}),
	location: one(locations, {
		fields: [stockMovements.locationId],
		references: [locations.locationId]
	}),
	user: one(users, {
		fields: [stockMovements.createdBy],
		references: [users.userId]
	}),
}));

export const locationsRelations = relations(locations, ({many}) => ({
	stockMovements: many(stockMovements),
	itemStocks: many(itemStock),
}));

export const businessCustomersRelations = relations(businessCustomers, ({one}) => ({
	customer: one(customers, {
		fields: [businessCustomers.businessCustomerId],
		references: [customers.customerId]
	}),
}));

export const itemStockRelations = relations(itemStock, ({one}) => ({
	location: one(locations, {
		fields: [itemStock.locationId],
		references: [locations.locationId]
	}),
	item: one(items, {
		fields: [itemStock.itemId],
		references: [items.itemId]
	}),
}));