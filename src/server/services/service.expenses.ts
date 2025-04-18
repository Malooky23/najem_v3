'use server'
import { EnrichedOrderExpenseSchemaType, ExpenseFilters, ExpenseSort } from "@/types/expense";
import { enrichedOrderExpenseView, expenseCategoryType, expenseCategoryTypeSchema } from "../db/schema";
import { and, asc, count, desc, eq, gte, ilike, lte, or, sql, SQL } from "drizzle-orm";
import { z } from "zod";
import { auth } from "@/lib/auth/auth";
import { db } from "../db";
import { PgSelect } from "drizzle-orm/pg-core/query-builders";

export type GetEnrichedOrderExpensesResponse = {
    success: boolean;
    data?: {
        data: EnrichedOrderExpenseSchemaType[] | any;
        pagination: {
            total: number;
            pageSize: number;
            currentPage: number;
            totalPages: number;
        };
    };
    error?: string;
};

// --- Helper functions (Modified slightly for clarity/typing) ---

// Define a type for the query builder function signature
type QueryBuilder<T> = (qb: PgSelect) => PgSelect;

function applyFilters(
    filters: ExpenseFilters,
    session: any // Replace 'any' with your actual session type if available
): QueryBuilder<typeof enrichedOrderExpenseView> {
    return (qb) => {
        let conditions: SQL[] = [];

        if (session.user.userType === 'CUSTOMER' && session.user.customerId) {
            conditions.push(eq(enrichedOrderExpenseView.customerId, session.user.customerId));
        }

        if (filters.customerId) {
            conditions.push(eq(enrichedOrderExpenseView.customerId, filters.customerId));
        }
        if (filters.orderNumber) {
            const orderNum = parseInt(filters.orderNumber, 10);
            if (!isNaN(orderNum)) {
                conditions.push(eq(enrichedOrderExpenseView.orderNumber, orderNum));
            }
        }
        if (filters.expenseItemName) {
            conditions.push(eq(enrichedOrderExpenseView.expenseItemName, filters.expenseItemName))
        }
        if (filters.expenseItemCategory) {
            conditions.push(eq(enrichedOrderExpenseView.expenseItemCategory, filters.expenseItemCategory as z.infer<typeof expenseCategoryTypeSchema>));
        }
        if (filters.dateRange?.from && filters.dateRange?.to) {
            conditions.push(
                and(
                    gte(enrichedOrderExpenseView.createdAt, filters.dateRange.from),
                    lte(enrichedOrderExpenseView.createdAt, filters.dateRange.to)
                )! // Use non-null assertion if confident 'and' won't return undefined here
            );
        }
        if (filters.search) {
            const searchTerm = `%${filters.search}%`;
            const searchConditions = or(
                ilike(sql`${enrichedOrderExpenseView.customerName}::text`, searchTerm),
                ilike(sql`${enrichedOrderExpenseView.expenseItemCategory}::text`, searchTerm),
                ilike(sql`${enrichedOrderExpenseView.expenseItemName}::text`, searchTerm),
                ilike(sql`${enrichedOrderExpenseView.notes}::text`, searchTerm),
            );
            if (searchConditions) conditions.push(searchConditions);
        }

        // Apply all conditions with 'and'
        if (conditions.length > 0) {
            return qb.where(and(...conditions));
        }
        return qb; // Return unmodified query builder if no filters
    };
}


function applySort(
    sort: ExpenseSort
): QueryBuilder<typeof enrichedOrderExpenseView> {
    return (qb) => {
        let field;
        switch (sort.field) {
            case 'orderNumber':
                field = enrichedOrderExpenseView.orderNumber;
                break;
            case 'customerName':
                field = enrichedOrderExpenseView.customerName;
                break;
            case 'status':
                field = enrichedOrderExpenseView.status;
                break;
            case 'createdAt': // Default case
            default:
                field = enrichedOrderExpenseView.createdAt;
                break;
        }
        return qb.orderBy(
            sort.direction === 'asc' ? asc(field) : desc(field)
        );
    };
}

function applyPagination(
    page: number,
    pageSize: number
): QueryBuilder<typeof enrichedOrderExpenseView> {
    return (qb) => qb.limit(pageSize).offset((page - 1) * pageSize);
}


export async function getOrderExpenses(
    page: number = 1,
    pageSize: number = 20,
    filters: ExpenseFilters = {},
    sort: ExpenseSort = { field: 'createdAt', direction: 'desc' }
): Promise<GetEnrichedOrderExpensesResponse> {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return { success: false, error: "Unauthorized: Please login." };
        }

        // --- 1. Build and Execute Count Query ---
        const filterQueryPart = applyFilters(filters, session);

        const { total, results } = await db.transaction(async (tx) => {
            // --- 1. Build and Execute Count Query (using tx) ---
            const countQuery = tx
                .select({ value: count() })
                .from(enrichedOrderExpenseView)
                .$dynamic();
            const finalCountQuery = filterQueryPart(countQuery); // Apply filters
            const countPromise = finalCountQuery; // Don't await yet

            // --- 2. Build Data Query (using tx) ---
            const dataQuery = tx
                .select()
                .from(enrichedOrderExpenseView)
                .$dynamic();
            const sortedQuery = applySort(sort)(filterQueryPart(dataQuery)); // Apply filters & sort
            const paginatedQuery = applyPagination(page, pageSize)(sortedQuery); // Apply pagination
            const dataPromise = paginatedQuery; 

            // --- 3. Execute both queries concurrently within the transaction ---
            const [ countResult, dataResult ] = await Promise.all([
                countPromise,
                dataPromise,
            ]);

            const currentTotal = countResult?.[ 0 ]?.value ?? 0;

            return { total: currentTotal, results: dataResult };
        }); // End of transaction
        


        if (total === 0) {
            return {
                success: true,
                data: {
                    data: [],
                    pagination: {
                        total: 0,
                        pageSize,
                        currentPage: page,
                        totalPages: 0
                    }
                }
            };
        }

        const totalPages = Math.ceil(total / pageSize);

        return {
            success: true,
            data: {
                data: results, // Drizzle returns the correctly typed results
                pagination: {
                    total,
                    pageSize,
                    currentPage: page,
                    totalPages,
                },
            },
        };

    } catch (error: any) {
        console.error("Error fetching order expenses:", error);
        // Consider more specific error handling/logging
        return { success: false, error: error.message || "Failed to fetch order expenses." };
    }
}

