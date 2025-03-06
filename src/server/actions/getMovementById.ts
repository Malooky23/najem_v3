"use server"

import { auth } from "@/lib/auth/auth";
import { EnrichedStockMovementView } from "@/types/stockMovement";
import { eq } from "drizzle-orm";
import { stockMovementsView } from "../db/schema";
import { db } from "@/server/db";

export type GetMovementByIdResponse = {
  success: boolean;
  data?: EnrichedStockMovementView;
  error?: string;
};

export async function getMovementById(movementId: string): Promise<GetMovementByIdResponse> {
  try {
    const session = await auth();
    if (!session) {
      return { success: false, error: "Unauthorized: Please Login." };
    }

    // Get the specific movement by ID
    const result = await db
      .select()
      .from(stockMovementsView)
      .where(eq(stockMovementsView.movementId, movementId))
      .limit(1);

    if (!result || result.length === 0) {
      return { success: false, error: "Movement not found" };
    }

    // Return the movement data directly without parsing to avoid errors
    return { 
      success: true, 
      data: result[0] as EnrichedStockMovementView 
    };
  } catch (error) {
    console.error('Error in getMovementById:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Unknown error getting movement" 
    };
  }
}
