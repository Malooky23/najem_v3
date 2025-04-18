


import { Skeleton } from "@/components/ui/skeleton";
import { items } from "@/server/db/schema";
import { fetchCustomers } from "@/server/DB-Queries/customers-queries";
import { Suspense } from "react";
import ExampleURLParams from "./ExampleURLParams";
import Customers from "./Customers";
import Link from "next/link";
import { FlaskConical } from "lucide-react";
import { QuickAccess } from "@/components/quick-access";

export default async function TestPage() {
    // const { data: itemsList, isLoading: isItemsLoading, isError: isItemsError } = useItemsQuery();

    return (

            <div className="p-4 flex-col">
                <h1 className="text-center text-lg font-bold">TEST PAGE</h1>
                <QuickAccess/>
                <div className="grid grid-cols-6">

                    <Suspense fallback={<div>
                        <h1 className="text-center text-lg font-bold text-red-500">TEST PAGE</h1>
                        <Skeleton className="h-[200px] w-full" />
                    </div>}>
                        <div className="col-span-1">

                            <Customers />
                        </div>
                        <div className="bg-green-100 w-full flex h-fit">
                            <ExampleURLParams />
                        </div>
                    </Suspense>
                </div>
                <h2 className="text-center text-lg font-bold">FGNJRFGNFJGN</h2>
            </div>

    )

}

