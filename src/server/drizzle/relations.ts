import { relations } from "drizzle-orm/relations";
import { users, loginAttempts, customers, orders, orderItems, items, locations, individualCustomers, addressDetails, stockReconciliation, entityAddresses, contactDetails, entityContactDetails, businessCustomers, stockMovements, orderHistory, itemStock } from "./schema";

export const loginAttemptsRelations = relations(loginAttempts, ({one}) => ({
	user: one(users, {
		fields: [loginAttempts.userId],
		references: [users.userId]
	}),
}));

export const usersRelations = relations(users, ({one, many}) => ({
	loginAttempts: many(loginAttempts),
	customer: one(customers, {
		fields: [users.customerId],
		references: [customers.customerId]
	}),
	orders: many(orders),
	stockReconciliations: many(stockReconciliation),
	items: many(items),
	stockMovements: many(stockMovements),
	orderHistories: many(orderHistory),
	itemStocks: many(itemStock),
}));

export const customersRelations = relations(customers, ({many}) => ({
	users: many(users),
	individualCustomers: many(individualCustomers),
	orders: many(orders),
	items: many(items),
	businessCustomers: many(businessCustomers),
}));

export const orderItemsRelations = relations(orderItems, ({one}) => ({
	order: one(orders, {
		fields: [orderItems.orderId],
		references: [orders.orderId]
	}),
	item: one(items, {
		fields: [orderItems.itemId],
		references: [items.itemId]
	}),
	location: one(locations, {
		fields: [orderItems.itemLocationId],
		references: [locations.locationId]
	}),
}));

export const ordersRelations = relations(orders, ({one, many}) => ({
	orderItems: many(orderItems),
	user: one(users, {
		fields: [orders.createdBy],
		references: [users.userId]
	}),
	customer: one(customers, {
		fields: [orders.customerId],
		references: [customers.customerId]
	}),
	addressDetail: one(addressDetails, {
		fields: [orders.addressId],
		references: [addressDetails.addressId]
	}),
	orderHistories: many(orderHistory),
}));

export const itemsRelations = relations(items, ({one, many}) => ({
	orderItems: many(orderItems),
	stockReconciliations: many(stockReconciliation),
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

export const locationsRelations = relations(locations, ({many}) => ({
	orderItems: many(orderItems),
	stockReconciliations: many(stockReconciliation),
	stockMovements: many(stockMovements),
	itemStocks: many(itemStock),
}));

export const individualCustomersRelations = relations(individualCustomers, ({one}) => ({
	customer: one(customers, {
		fields: [individualCustomers.individualCustomerId],
		references: [customers.customerId]
	}),
}));

export const addressDetailsRelations = relations(addressDetails, ({many}) => ({
	orders: many(orders),
	entityAddresses: many(entityAddresses),
}));

export const stockReconciliationRelations = relations(stockReconciliation, ({one}) => ({
	item: one(items, {
		fields: [stockReconciliation.itemId],
		references: [items.itemId]
	}),
	location: one(locations, {
		fields: [stockReconciliation.locationId],
		references: [locations.locationId]
	}),
	user: one(users, {
		fields: [stockReconciliation.performedBy],
		references: [users.userId]
	}),
}));

export const entityAddressesRelations = relations(entityAddresses, ({one}) => ({
	addressDetail: one(addressDetails, {
		fields: [entityAddresses.addressId],
		references: [addressDetails.addressId]
	}),
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

export const businessCustomersRelations = relations(businessCustomers, ({one}) => ({
	customer: one(customers, {
		fields: [businessCustomers.businessCustomerId],
		references: [customers.customerId]
	}),
}));

export const stockMovementsRelations = relations(stockMovements, ({one, many}) => ({
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
	itemStocks: many(itemStock),
}));

export const orderHistoryRelations = relations(orderHistory, ({one}) => ({
	order: one(orders, {
		fields: [orderHistory.orderId],
		references: [orders.orderId]
	}),
	user: one(users, {
		fields: [orderHistory.changedBy],
		references: [users.userId]
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
	stockMovement: one(stockMovements, {
		fields: [itemStock.lastMovementId],
		references: [stockMovements.movementId]
	}),
	user: one(users, {
		fields: [itemStock.lastReconciliationBy],
		references: [users.userId]
	}),
}));