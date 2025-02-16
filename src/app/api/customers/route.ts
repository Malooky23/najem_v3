import { auth } from "@/lib/auth/auth";
import { customerService } from '@/server/services/customer-services';
import { NextResponse, NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  try {
    if(request){
      console.log(request)
    }
    const session = await auth();
    if (!session || session.user.userType !== 'EMPLOYEE') {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
    const customers = await customerService.getAllCustomers();
    return NextResponse.json(customers);

  } catch (error: any) {
    console.error("API Error fetching customers:", error);
    return NextResponse.json(
      { message: "Failed to fetch customers" },
      { status: 500 }
    );
  }
}
// catch (error) {
//   console.error("Error fetching customers:", error);
//   return NextResponse.json(
//     {
//       error: "Failed to fetch customers",
//       details: error instanceof Error ? error.message : "Unknown error"
//     },
//     { status: 500 }
//   );
// }
// }

