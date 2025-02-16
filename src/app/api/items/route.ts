// src/app/api/items/route.ts
import { NextResponse } from 'next/server';
import { itemService } from '@/server/services/items-services';
import { auth } from "@/lib/auth/auth"

export const GET = auth(async function GET(req) {
    try {
        if (req.auth) {
          if(req.auth.user.userType === 'EMPLOYEE'){
            const items = await itemService.getAllItems();
            return NextResponse.json(items);
          }
         if(req.auth.user.userType === 'CUSTOMER'){
            return NextResponse.json((req.auth.user.customerId ??  {message: "nothing"} ));

         } 
        }
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 })

    } catch (error: any) {
      console.error("API Error fetching Items:", error);
      return NextResponse.json(
        { message: "Failed to fetch Items" },
        { status: 500 }
      );
    }
  })
