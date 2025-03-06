import { auth } from "@/lib/auth/auth";
import { getStockMovements } from "@/server/actions/getStockMovements";
import { StockMovementFilters, StockMovementSort } from "@/types/stockMovement";
import { NextRequest, NextResponse } from "next/server";

// Adjust this value to control delay duration (in milliseconds)
const ARTIFICIAL_DELAY = 5000;

export async function GET(request: NextRequest) {
  try {
    // Add artificial delay to trigger suspense
    await new Promise(resolve => setTimeout(resolve, ARTIFICIAL_DELAY));

    // Authentication check
    const session = await auth()
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = parseInt(searchParams.get("pageSize") || "10");
    
    // Parse filters from query params
    const filtersParam = searchParams.get("filters");
    let filters: StockMovementFilters = {};
    if (filtersParam) {
      try {
        filters = JSON.parse(filtersParam);
      } catch (e) {
        console.error("Error parsing filters:", e);
      }
    }
    
    // Parse sort options from query params
    const sortParam = searchParams.get("sort");
    let sort: StockMovementSort = { field: 'createdAt', direction: 'desc' };
    if (sortParam) {
      try {
        sort = JSON.parse(sortParam);
      } catch (e) {
        console.error("Error parsing sort:", e);
      }
    }

    // Call the server action
    const result = await getStockMovements(page, pageSize, filters, sort);
    
    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Failed to fetch stock movements" },
        { status: 400 }
      );
    }

    return NextResponse.json(result.data);
  } catch (error: any) {
    console.error("API route error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
