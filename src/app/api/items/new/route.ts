// src/app/api/items/route.ts
import { NextResponse } from 'next/server';
import { itemService } from '@/server/services/items-services';
import { auth } from "@/lib/auth/auth"
import { createItemsSchema } from '@/types/items';


export const POST = auth(
  async function POST(req) {
    try {
      if (req.auth) {
        if (req.auth.user.userType === 'EMPLOYEE') {
          const data = req.json()
          const userId = req.auth.user.id
          const validatedData = createItemsSchema.parse(data)
          
          if(validatedData.createdBy === userId){
            console.log("User ID MATCH - ALLOW")
            console.log('validatedData:m', validatedData)
            return NextResponse.json({ 
              success: true, 
              message: "YOU MAY PROCEED" }, { status: 201 })
          }else{
            console.log("User ID NOT MATCH")
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
          }


        }
        if (req.auth.user.userType === 'CUSTOMER') {
          console.log('Customer Item Creation Not Implemented')
          return NextResponse.json({ message: "Unauthorized" }, { status: 401 })

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
  }
)


