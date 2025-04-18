
'use client'
import { useCustomers } from "@/hooks/data-fetcher"

export default function Customers() {
    const {data:customers} = useCustomers()
    // await new Promise((resolve) => setTimeout(resolve, 500))
    return (
        <div className="justify-center flex-1 p-4">
            <pre>
                {customers?.map((item, key) =>
                    <li key={key}>{key} - {item.displayName}</li>)
                }
            </pre>
        </div>
    )

}
