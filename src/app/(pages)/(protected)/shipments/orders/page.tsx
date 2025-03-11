import { Button } from "@/components/ui/button";
import Link from "next/link";


export default function Page() {    
    return (
        <div className="flex flex-col gap-4 container h-full items-center justify-center text-center mx-auto p-8">

            
            <h1>Order Shipments</h1>
            <p>Coming Soon.</p>
            <Link href="/dashboard">
            <Button  variant="outline">Go to Dashboard</Button>
            </Link>

        </div>
    )
}   