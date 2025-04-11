import { relations } from "drizzle-orm/relations";
import { orders, orderHistory, users, customers, businessCustomers, contactDetails, entityContactDetails, individualCustomers, addressDetails, loginAttempts, locations, orderItems, items, stockMovements, entityAddresses, stockReconciliation, itemStock } from "./schema";

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

export const ordersRelations = relations(orders, ({one, many}) => ({
	orderHistories: many(orderHistory),
	addressDetail: one(addressDetails, {
		fields: [orders.addressId],
		references: [addressDetails.addressId]
	}),
	user: one(users, {
		fields: [orders.createdBy],
		references: [users.userId]
	}),
	customer: one(customers, {
		fields: [orders.customerId],
		references: [customers.customerId]
	}),
	orderItems: many(orderItems),
}));

export const usersRelations = relations(users, ({one, many}) => ({
	orderHistories: many(orderHistory),
	orders: many(orders),
	loginAttempts: many(loginAttempts),
	stockMovements: many(stockMovements),
	items: many(items),
	stockReconciliations: many(stockReconciliation),
	customer: one(customers, {
		fields: [users.customerId],
		references: [customers.customerId]
	}),
	itemStocks: many(itemStock),
}));

export const businessCustomersRelations = relations(businessCustomers, ({one}) => ({
	customer: one(customers, {
		fields: [businessCustomers.businessCustomerId],
		references: [customers.customerId]
	}),
}));

export const customersRelations = relations(customers, ({many}) => ({
	businessCustomers: many(businessCustomers),
	individualCustomers: many(individualCustomers),
	orders: many(orders),
	items: many(items),
	users: many(users),
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

export const loginAttemptsRelations = relations(loginAttempts, ({one}) => ({
	user: one(users, {
		fields: [loginAttempts.userId],
		references: [users.userId]
	}),
}));

export const orderItemsRelations = relations(orderItems, ({one}) => ({
	location: one(locations, {
		fields: [orderItems.itemLocationId],
		references: [locations.locationId]
	}),
	item: one(items, {
		fields: [orderItems.itemId],
		references: [items.itemId]
	}),
	order: one(orders, {
		fields: [orderItems.orderId],
		references: [orders.orderId]
	}),
}));

export const locationsRelations = relations(locations, ({many}) => ({
	orderItems: many(orderItems),
	stockMovements: many(stockMovements),
	stockReconciliations: many(stockReconciliation),
	itemStocks: many(itemStock),
}));

export const itemsRelations = relations(items, ({one, many}) => ({
	orderItems: many(orderItems),
	stockMovements: many(stockMovements),
	user: one(users, {
		fields: [items.createdBy],
		references: [users.userId]
	}),
	customer: one(customers, {
		fields: [items.customerId],
		references: [customers.customerId]
	}),
	stockReconciliations: many(stockReconciliation),
	itemStocks: many(itemStock),
}));

export const stockMovementsRelations = relations(stockMovements, ({one, many}) => ({
	user: one(users, {
		fields: [stockMovements.createdBy],
		references: [users.userId]
	}),
	item: one(items, {
		fields: [stockMovements.itemId],
		references: [items.itemId]
	}),
	location: one(locations, {
		fields: [stockMovements.locationId],
		references: [locations.locationId]
	}),
	itemStocks: many(itemStock),
}));

export const entityAddressesRelations = relations(entityAddresses, ({one}) => ({
	addressDetail: one(addressDetails, {
		fields: [entityAddresses.addressId],
		references: [addressDetails.addressId]
	}),
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

export const itemStockRelations = relations(itemStock, ({one}) => ({
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
	location: one(locations, {
		fields: [itemStock.locationId],
		references: [locations.locationId]
	}),
}));