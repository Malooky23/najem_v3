
'use client'
import { Input } from "@/components/ui/input"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useCallback } from "react"

export default function ExpenseSearchPanel() {

    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()

    const createQueryString = useCallback(
        (name: string, value: string) => {
            const params = new URLSearchParams(searchParams.toString())
            params.set(name, value)

            return params.toString()
        },
        [ searchParams ]
    )
    const updateURL = (input: { target: { value: string } }) => {
        router.replace(pathname+ "?"+createQueryString("search", input.target.value))
        if(input.target.value === '' || null){
            router.replace(pathname )
        }
    }

    return (
        <>
            <Input className="bg-white" placeholder="Search" onChange={updateURL}></Input>
        </>
    )
}