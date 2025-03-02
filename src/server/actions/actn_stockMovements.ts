"use server"

import { auth } from "@/lib/auth/auth";
import { MovementType,StockMovementSortFields, EnrichedStockMovementView, stockMovementsView as stockMovementsViewSchema, StockMovementFilters, StockMovementSort } from "@/types/stockMovement";
import { and, sql } from "drizzle-orm";
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
        // if (session.user.userType !== 'EMPLOYEE') {
        //     return { success: false, error: "Unauthorized: User has insufficient permissions." };
        // }

        const offset = (page - 1) * pageSize;

        // Build the WHERE clause conditions
        let conditions = sql``;
        const userType = session.user.userType

        if (filters.customerId || filters.movement || filters.dateRange|| userType==='CUSTOMER') {
            const whereClauses = [];

            if (userType === 'CUSTOMER') {
                if (session.user.customerId) {
                    whereClauses.push(sql`${stockMovementsView.customerId} = ${session.user.customerId}`);
                }
            }
            if (filters.customerId) {
                whereClauses.push(sql`${stockMovementsView.customerId} = ${filters.customerId}`);
            }
            if (filters.movement) {
                whereClauses.push(sql`${stockMovementsView.movementType} = ${filters.movement}`);
            }
            if (filters.dateRange) {
                whereClauses.push(sql`${stockMovementsView.createdAt} >= ${filters.dateRange.from} AND ${stockMovementsView.createdAt} <= ${filters.dateRange.to}`);
            }

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
        // console.log(results.rows[0])
        // Add type validation for raw query results
        if (!results?.rows || !Array.isArray(results.rows)) {
            throw new Error('Invalid query results structure');
        }
        // console.log("Results:", results)

        // Transform and validate each order
        const parsedResults = results.rows.map((stockMovementsView) => {

            // Validate and transform dates
            return {
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
            }


        });

        // Validate entire array against schema
        try {
            // console.log(enrichedOrders)
            const parsedOrders = stockMovementsViewSchema.array().parse(parsedResults);
            // Get total count for pagination
            //     const countQuery: any = await db.execute(sql<{ count: number }[]>`
            //     SELECT count(*) as count
            //     FROM ${orders}
            //     ${conditions}
            // `);

            // const countQuery = await db
            //     .select({ count: sql`count(*)` })
            //     .from(orders)
            //     .where(conditions ? conditions : undefined);

            // const countQuery = await db
            //     .select({
            //         count: sql<number>`count(*)::integer`
            //     })
            //     .from(orders)
            //     .where(conditions ? conditions : undefined);

            // const totalCount = Number(countQuery[0]?.count) || 0;

            const countQuery = await db.execute(sql<{ count: number }>`
                SELECT count(*)::integer as count 
                FROM ${stockMovementsView} 
                ${conditions ? conditions : sql``}
            `);

            const totalCount = Number(countQuery.rows[0]?.count) || 0;


            console.log(countQuery.rows[0])
            // const totalCount = Number(countQuery[0]?.count) || 0;

            return {
                success: true,
                data: {
                    data: parsedOrders,
                    pagination: {
                        total: totalCount,
                        pageSize,
                        currentPage: page,
                        totalPages: Math.ceil(totalCount / pageSize)
                    }
                }
            };
        } catch (error) {
            console.error('Error in getOrders:', error);
            return { success: false, error: 'Failed to fetch orders' };
        }
    } catch (error) {
        console.error('Error in getOrders:', error);
        return { success: false, error: 'Failed to fetch orders' };
    }
}
