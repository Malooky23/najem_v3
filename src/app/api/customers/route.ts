import { auth } from "@/lib/auth/auth";
import { customerService } from '@/server/services/customer-services';
import { NextResponse } from "next/server";

export const GET = auth(async function GET(req) {
    try {
        if (req.auth) {
          if(req.auth.user.userType === 'EMPLOYEE'){
            const customers = await customerService.getAllCustomers();
            return NextResponse.json(customers);

          }
        }
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 })

    } catch (error: any) {
      console.error("API Error fetching customers:", error);
      return NextResponse.json(
        { message: "Failed to fetch customers" },
        { status: 500 }
      );
    }
  })
