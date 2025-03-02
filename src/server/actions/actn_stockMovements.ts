"use server"

import { auth } from "@/lib/auth/auth";
import { MovementType,StockMovementSortFields, EnrichedStockMovementView, stockMovementsView as stockMovementsViewSchema, StockMovementFilters, StockMovementSort } from "@/types/stockMovement";
import { and, or, sql } from "drizzle-orm";
import { stockMovements, StockMovementsView, stockMovementsView } from "../db/schema";
import { db } from "@/server/db";


export type GetStockMovementsResponse = {
    success: boolean;
    data?: {
        data: EnrichedStockMovementView[] | any;
        pagination: {
            total: number;
            pageSize: number;
            currentPage: number;
            totalPages: number;
        };
    };
    error?: string;
};

export async function getStockMovements(
    page: number = 1,
    pageSize: number = 100,
    filters: StockMovementFilters = {},
    sort: StockMovementSort = { field: 'createdAt', direction: 'desc' }
): Promise<GetStockMovementsResponse> {
    try {
        const session = await auth();
        if (!session) {
            return { success: false, error: "Unauthorized: Please Login." };
        }

        const offset = (page - 1) * pageSize;

        // Build the WHERE clause conditions
        let conditions = sql``;
        const userType = session.user.userType
        const whereClauses = [];

        // Add user type restriction
        if (userType === 'CUSTOMER' && session.user.customerId) {
            whereClauses.push(sql`${stockMovementsView.customerId} = ${session.user.customerId}`);
        }

        // Add filters
        if (filters.customerId) {
            whereClauses.push(sql`${stockMovementsView.customerId} = ${filters.customerId}`);
        }
        if (filters.movement) {
            whereClauses.push(sql`${stockMovementsView.movementType} = ${filters.movement}`);
        }
        if (filters.dateRange) {
            whereClauses.push(sql`${stockMovementsView.createdAt} >= ${filters.dateRange.from} AND ${stockMovementsView.createdAt} <= ${filters.dateRange.to}`);
        }
        if (filters.itemName) {
            whereClauses.push(sql`${stockMovementsView.itemName} ILIKE ${`%${filters.itemName}%`}`);
        }
        if (filters.customerDisplayName) {
            whereClauses.push(sql`${stockMovementsView.customerDisplayName} ILIKE ${`%${filters.customerDisplayName}%`}`);
        }
        if (filters.search) {
            whereClauses.push(sql`(
                ${stockMovementsView.itemName} ILIKE ${`%${filters.search}%`} OR
                ${stockMovementsView.customerDisplayName} ILIKE ${`%${filters.search}%`} OR
                ${stockMovementsView.movementNumber}::text LIKE ${`%${filters.search}%`} OR
                ${stockMovementsView.quantity}::text LIKE ${`%${filters.search}%`}
            )`);
        }

        if (whereClauses.length > 0) {
            conditions = sql`WHERE ${and(...whereClauses)}`;
        }

        // Map sort field to database column name
        const sortFieldMap: Record<StockMovementSortFields, string> = {
            createdAt: 'created_at',
            movementType: 'movement_type',
            quantity: 'quantity',
            itemName: 'item_name',
            customerDisplayName: 'customer_display_name',
            stockLevelAfter: 'stock_level_after',
            movementNumber: 'movement_number'
        };

        const dbSortField = sortFieldMap[sort.field] || 'created_at';
        const orderBySql = sql`ORDER BY ${sql.raw(dbSortField)} ${sort.direction === 'desc' ? sql`DESC` : sql`ASC`}`;

        // Construct the main query
        const rawQuery = sql<StockMovementsView[]>`
            SELECT *
            FROM ${stockMovementsView}
            ${conditions}
            ${orderBySql}
            LIMIT ${pageSize} OFFSET ${offset}
        `;

        const results = await db.execute(rawQuery);
        if (!results?.rows || !Array.isArray(results.rows)) {
            throw new Error('Invalid query results structure');
        }

        // Transform and validate each movement
        const parsedResults = results.rows.map((stockMovementsView) => ({
            movementId: stockMovementsView.movement_id,
            movementNumber: stockMovementsView.movement_number,
            itemId: stockMovementsView.item_id,
            locationId: stockMovementsView.location_id,
            movementType: stockMovementsView.movement_type,
            quantity: stockMovementsView.quantity,
            referenceType: stockMovementsView.reference_type,
            referenceId: stockMovementsView.reference_id,
            notes: stockMovementsView.notes,
            createdBy: stockMovementsView.created_by,
            createdAt: stockMovementsView.created_at ? new Date(stockMovementsView.created_at.toString()) : null,
            itemName: stockMovementsView.item_name,
            customerId: stockMovementsView.customer_id,
            customerDisplayName: stockMovementsView.customer_display_name,
            stockLevelAfter: stockMovementsView.stock_level_after
        }));

        // Validate entire array against schema
        try {
            const parsedMovements = stockMovementsViewSchema.array().parse(parsedResults);

            const countQuery = await db.execute(sql<{ count: number }>`
                SELECT count(*)::integer as count 
                FROM ${stockMovementsView} 
                ${conditions}
            `);

            const totalCount = Number(countQuery.rows[0]?.count) || 0;

            return {
                success: true,
                data: {
                    data: parsedMovements,
                    pagination: {
                        total: totalCount,
                        pageSize,
                        currentPage: page,
                        totalPages: Math.ceil(totalCount / pageSize)
                    }
                }
            };
        } catch (error) {
            console.error('Error in getStockMovements:', error);
            return { success: false, error: 'Failed to fetch stock movements' };
        }
    } catch (error) {
        console.error('Error in getStockMovements:', error);
        return { success: false, error: 'Failed to fetch stock movements' };
    }
}
