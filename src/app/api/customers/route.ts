import { auth } from "@/lib/auth/auth";
import { QUERIES } from "@/server/db/queries";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const session = await auth();
  
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // const url = new URL(request.url);
    // const delayMs = parseInt(url.searchParams.get('delay') || '0');
    // console.log(delayMs)
    const customers = await QUERIES.getCustomers();
    
    return NextResponse.json({
      data: customers,
      status: "success"
    });
    
  } catch (error) {
    console.error("Error fetching customers:", error);
    return NextResponse.json(
      { 
        error: "Failed to fetch customers",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}
