'use client'

import { useItemsQuery } from "@/hooks/data/useItems";
import { items } from "@/server/db/schema";

export default function TestPage() {
    const { data: itemsList, isLoading: isItemsLoading, isError: isItemsError } = useItemsQuery();

    return(
        <div>
            {/* <pre>{JSON.stringify(itemsList,null,2)}</pre> */}
            <pre>
                    {itemsList?.map( (item) =>
                    <li>{item.customerDisplayName}</li>)}
            </pre>
        </div>
    )

}