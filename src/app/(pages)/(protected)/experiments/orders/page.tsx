'use client'
import { Button } from "@/components/ui/button";
import { orderInsertSchema, orders } from "@/server/db/schema";
import { createUpdateSchema } from "drizzle-zod";


export default function OrdersPage() {

    const update = createUpdateSchema(orders)
    const testInsertOrder = {
        customerId: "123e4567-e89b-12d3-a456-426614174000",
        orderType: "CUSTOMER_ORDER",
        movement: "IN",
        // packingType: "NONE",
        deliveryMethod: "NONE",
        status: "PENDING",
        // addressId: null,
        // notes: null,
        // orderMark: null,
        // items: [
        //     {
        //         itemId: "123e4567-e89b-12d3-a456-426614174001",
        //         quantity: 10,
        //         itemLocationId: "123e4567-e89b-12d3-a456-426614174002"
        //     }
        // ],
        createdBy: "123e4567-e89b-12d3-a456-426614174003"
    };

    const testParse = () => {
        const result = update.safeParse(testInsertOrder);
        console.log(result.error ? result.error : "No errors found" );
    };
        

    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4">
            <h1>Orders Test</h1>
            <Button onClick={() => testParse()}>Click Me</Button>
        </div>
    );
}