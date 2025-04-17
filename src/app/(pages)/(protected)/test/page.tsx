


import { Skeleton } from "@/components/ui/skeleton";
import { items } from "@/server/db/schema";
import { fetchCustomers } from "@/server/queries/customers-queries";
import { Suspense } from "react";
import ExampleURLParams from "./URLParams";

export default async function TestPage() {
    // const { data: itemsList, isLoading: isItemsLoading, isError: isItemsError } = useItemsQuery();

    return (
        <div className="p-4 flex-col">
            {/* <pre>{JSON.stringify(customers,null,2)}</pre> */}
            <h1 className="text-center text-lg font-bold">TEST PAGE</h1>
            <Suspense fallback={<div>
                <h1 className="text-center text-lg font-bold text-red-500">TEST PAGE</h1>
                <Skeleton className="h-[200px] w-full"/>
                </div>}>
            {/* <Suspense> */}
                <Customers/>
            </Suspense>
                <h2 className="text-center text-lg font-bold">FGNJRFGNFJGN</h2>
        </div>
    )

}

async function Customers() {
    const customers = await fetchCustomers()
    // await new Promise((resolve) => setTimeout(resolve, 500))
    return (
        <div className="flex-1 justify-center flex-1 p-4">
            <div className="bg-green-100 p-16 flex justify-center items-center">
                <ExampleURLParams/>
            </div>
            <pre>
                {customers?.map((item, key) =>
                    <li key={key}>{key} - {item.displayName}</li>)
                }
            </pre>
        </div>
    )

}
