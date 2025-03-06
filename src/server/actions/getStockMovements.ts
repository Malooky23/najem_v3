"use server"

import { auth } from "@/lib/auth/auth";
import { MovementType, StockMovementSortFields, EnrichedStockMovementView, stockMovementsView as stockMovementsViewSchema, StockMovementFilters, StockMovementSort } from "@/types/stockMovement";
import { and, eq, gte, ilike, lte, or, SQL, sql, desc, asc } from "drizzle-orm";
import { stockMovements, StockMovementsView, stockMovementsView } from "../db/schema";
import { db } from "@/server/db";
import { PgSelect } from "drizzle-orm/pg-core";

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
// First, let's create helper functions for our query building
function withFilters<T extends PgSelect>(
    qb: T,
    filters: StockMovementFilters,
    session: any
) {
    let query = qb;

    // User type restriction
    if (session.user.userType === 'CUSTOMER' && session.user.customerId) {
        query = query.where(eq(stockMovementsView.customerId, session.user.customerId));
    }

    if (filters.customerId) {
        query = query.where(eq(stockMovementsView.customerId, filters.customerId));
    }

    if (filters.movement) {
        query = query.where(eq(stockMovementsView.movementType, filters.movement));
    }

    if (filters.dateRange) {
        query = query.where(
            and(
                gte(stockMovementsView.createdAt, filters.dateRange.from),
                lte(stockMovementsView.createdAt, filters.dateRange.to)
            )
        );
    }

    if (filters.itemName) {
        query = query.where(ilike(stockMovementsView.itemName, `%${filters.itemName}%`));
    }

    if (filters.customerDisplayName) {
        query = query.where(ilike(stockMovementsView.customerDisplayName, `%${filters.customerDisplayName}%`));
    }

    // Improved search handling - make sure it works with any value
    if (filters.search !== undefined && filters.search !== null) {
        console.log("Applying search filter:", filters.search);
        query = query.where(
            or(
                ilike(stockMovementsView.itemName, `%${filters.search}%`),
                ilike(stockMovementsView.customerDisplayName, `%${filters.search}%`),
                ilike(sql`${stockMovementsView.movementNumber}::text`, `%${filters.search}%`),
                ilike(sql`${stockMovementsView.quantity}::text`, `%${filters.search}%`)
            )
        );
    }

    return query;
}

function withPagination<T extends PgSelect>(
    qb: T,
    page: number = 1,
    pageSize: number = 100
) {
    return qb.limit(pageSize).offset((page - 1) * pageSize);
}

function withSort<T extends PgSelect>(
    qb: T,
    sort: StockMovementSort
) {
    // Clear any existing order by clauses
    const freshQuery = qb.orderBy();
    
    return freshQuery.orderBy(
        sort.direction === 'desc' 
            ? desc(stockMovementsView[sort.field])
            : asc(stockMovementsView[sort.field])
    );
}


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

        // Debug incoming params
        console.log("Server action called with page:", page, "pageSize:", pageSize);
        console.log("Server action filters:", JSON.stringify(filters));
        
        // Build base query and make it dynamic
        let query = db.select()
            .from(stockMovementsView)
            .$dynamic();

        // Apply filters, pagination and sorting
        query = withFilters(query, filters, session);
        query = withSort(query, sort);
        query = withPagination(query, page, pageSize);

        // Execute main query
        const results = await query;

        // Build and execute count query
        let countQuery = db.select({ 
            count: sql<number>`count(*)::integer` 
        })
        .from(stockMovementsView)
        .$dynamic();
        
        countQuery = withFilters(countQuery, filters, session);
        const countResult = await countQuery;

        const totalCount = countResult[0].count;
        
        // Return data with proper parsing
        return {
            success: true,
            data: {
                data: results,
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
        return { success: false, error: error instanceof Error ? error.message : "Unknown error getting stock movements" };
    }
}
