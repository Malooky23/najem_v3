// src/app/api/items/route.ts
import { NextResponse } from 'next/server';
import { itemService } from '@/server/services/items-services';

export async function GET() {
    try {
        const items = await itemService.getAllItems();
        return NextResponse.json(items);
    } catch (error: any) {
        console.error("API Error fetching items:", error);
        return NextResponse.json({ message: "Failed to fetch items" }, { status: 500 });
    }
}