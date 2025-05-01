'use client'

import { Input } from "@/components/ui/input";
import { useCustomers } from "@/hooks/data-fetcher";
import { useCustomerByIdQuery } from "@/hooks/data/NEWuseCustomers";
import { useState } from "react";

export default function CustomerPage() {
    const [ input, setInput ] = useState("")
    const {
        isLoading: isQueryLoading,
        isFetching: isQueryFetching,
        isError,
        error,
        isSuccess,
        data: freshCustomer
    } = useCustomerByIdQuery(input);

    const { data: fullList } = useCustomers()


    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            setInput(e.currentTarget.value);
        }
    };


    return (
        <div className="w-full h-full flex ">
            <div className="w-full flex">
                <ul>
                    {fullList?.map((customer) => (
                        <li key={customer.customerId}>{customer.customerId}</li>
                    ))}
                </ul>
            </div>

            <div className="w-full flex">
                <Input onKeyDown={handleKeyDown} className="bg-white"/>
                <pre>{JSON.stringify(freshCustomer, null, 2)}</pre>
            </div>
        </div>
    )
}