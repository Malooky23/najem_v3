'use server'
import { EnrichedOrderExpenseSchemaType, ExpenseFilters, ExpenseSort } from "@/types/expense";
import { enrichedOrderExpenseView, expenseCategoryTypeSchema } from "../db/schema";
import { and, asc,  desc, eq, getViewSelectedFields, gte, ilike, lte, or, sql, SQL } from "drizzle-orm";
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
            console.log("here 2", filters.orderNumber)
            const orderNum = parseInt(filters.orderNumber, 10);
            if (!isNaN(orderNum)) {
                conditions.push(eq(enrichedOrderExpenseView.orderNumber, orderNum));
                console.log("order number pushed")
            }
        }
        if (filters.expenseItemName) {
            conditions.push(eq(enrichedOrderExpenseView.expenseItemName, filters.expenseItemName))
        }
        if (filters.status) {
            conditions.push(eq(enrichedOrderExpenseView.status, filters.status))
        }
        if (filters.expenseItemCategory) {
            conditions.push(eq(enrichedOrderExpenseView.expenseItemCategory, filters.expenseItemCategory as z.infer<typeof expenseCategoryTypeSchema>));
        }
        if (filters.dateRange?.from && filters.dateRange?.to) {
            const fromDate = filters.dateRange.from;
            const toDateOriginal = filters.dateRange.to;

            // --- Adjust toDate to the very end of the day ---
            const toDateEndOfDay = new Date(toDateOriginal);
            toDateEndOfDay.setHours(23, 59, 59, 999);
            // --- End adjustment ---
            conditions.push(
                and(
                    gte(enrichedOrderExpenseView.createdAt, fromDate),
                    lte(enrichedOrderExpenseView.createdAt, toDateEndOfDay)
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

        const dataQuery = db.select({
            ...getViewSelectedFields(enrichedOrderExpenseView),
            value: sql<number>`count(*) over()::integer`
        })
            .from(enrichedOrderExpenseView)
            .$dynamic();
        const sortedQuery = applySort(sort)(filterQueryPart(dataQuery)); // Apply filters & sort
        const paginatedQuery = applyPagination(page, pageSize)(sortedQuery); // Apply pagination
        const queryResponse = await paginatedQuery


        const currentTotal = queryResponse.length > 0 ? queryResponse?.[ 0 ]?.value : 0 



        if (currentTotal === 0) {
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

        const totalPages = Math.ceil(currentTotal / pageSize);

        return {
            success: true,
            data: {
                data: queryResponse, // Drizzle returns the correctly typed results
                pagination: {
                    total: currentTotal,
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

