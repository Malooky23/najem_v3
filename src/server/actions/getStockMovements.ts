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


    if (filters.search !== undefined && filters.search !== null) {
        console.log("Applying search filter:", filters.search);
        if (session.user.userType === 'EMPLOYEE') {
            query = query.where(
                or(
                    ilike(stockMovementsView.itemName, `%${filters.search}%`),
                    ilike(stockMovementsView.customerDisplayName, `%${filters.search}%`),
                    ilike(sql`${stockMovementsView.movementNumber}::text`, `%${filters.search}%`),
                    ilike(sql`${stockMovementsView.quantity}::text`, `%${filters.search}%`)
                )
            );
        } else if (session.user.userType === 'CUSTOMER' && session.user.customerId) {
            query = query.where(
                and(
                    eq(stockMovementsView.customerId, session.user.customerId),

                    or(
                        ilike(stockMovementsView.itemName, `%${filters.search}%`),
                        ilike(stockMovementsView.customerDisplayName, `%${filters.search}%`),
                        ilike(sql`${stockMovementsView.movementNumber}::text`, `%${filters.search}%`),
                        ilike(sql`${stockMovementsView.quantity}::text`, `%${filters.search}%`)
                    )
                )
            );
        }
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
            ? desc(stockMovementsView[ sort.field ])
            : asc(stockMovementsView[ sort.field ])
    );
}


export async function getStockMovements(
    page: number = 1,
    pageSize: number = 20,
    filters: StockMovementFilters = {},
    sort: StockMovementSort = { field: 'movementNumber', direction: 'desc' }
): Promise<GetStockMovementsResponse> {
    try {
        const session = await auth();
        let customer
        if (!session) {
            return { success: false, error: "Unauthorized: Please Login." };
        }
        if (session.user.userType === 'CUSTOMER' && !session.user.customerId)
            return { success: false, error: "Unauthorized: Customer ID not assigned to user." };

        let query = db.select(
            {
                movementId: stockMovementsView.movementId,
                movementNumber: stockMovementsView.movementNumber,
                itemId: stockMovementsView.itemId,
                locationId: stockMovementsView.locationId,
                movementType: stockMovementsView.movementType,
                quantity: stockMovementsView.quantity,
                referenceType: stockMovementsView.referenceType,
                referenceId: stockMovementsView.referenceId,
                notes: stockMovementsView.notes,
                createdBy: stockMovementsView.createdBy,
                createdAt: stockMovementsView.createdAt,
                itemName: stockMovementsView.itemName,
                customerId: stockMovementsView.customerId,
                customerDisplayName: stockMovementsView.customerDisplayName,
                stockLevelAfter: stockMovementsView.stockLevelAfter,
                totalCount: sql<number>`count(*) over()::integer`,
            }
        )
            .from(stockMovementsView)
            .$dynamic();




        // Apply filters, pagination and sorting
        query = withFilters(query, filters, session);
        query = withSort(query, sort);
        query = withPagination(query, page, pageSize);


        // Execute main query
        const results = await query;

        const totalCount = results.length > 0 ? results[ 0 ].totalCount : 0;

        // Remove totalCount from result objects
        const data = results.map(({ totalCount: _, ...rest }) => rest);



        // Return data with proper parsing
        return {
            success: true,
            data: {
                // data: results,
                data,
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
